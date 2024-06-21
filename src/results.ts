import puppeteer from 'puppeteer'
import express from 'express'
import bodyParser from 'body-parser'
import ejs from "ejs"
import ws from "ws"
import zlib from "zlib"
import {Context, Telegraf} from 'telegraf'
import {sessionTypes, SessionType, Language} from "./utils/constants"
import {DRIVER_NAMES} from "./utils/drivers"
import {extractCurrentRound} from "./utils/rounds2024"
import {timeConverter} from "./utils/time"

const bot = new Telegraf(process.env.BOT_TOKEN)
const ADMIN_ID = process.env.ADMIN_ID

const sortPosition = (a: any, b: any) => {
    const [, aLine] = a;
    const [, bLine] = b;
    const aPos = Number(aLine.Position);
    const bPos = Number(bLine.Position);
    return aPos - bPos;
};

let state = {};

function translateLappedText(gap: string) {
    const indexOfL = gap.indexOf("L")
    if (indexOfL !== -1) {
        return gap.substring(0, indexOfL) + "К"
    }
    return gap
}

function mapSourceDataToDriver(sessionType: SessionType, it: any, i: number) {
    const knownDriver = DRIVER_NAMES[it[0]]
    const driver = knownDriver != null ? knownDriver : (DRIVER_NAMES["??"] )
    const driverData = {
        nameBLR: driver.nameBLR,
        nameUKR: driver.nameUKR,
        teamId: driver.teamId,
        // replacement: knownDriver == null,

        // practice
        bestLapTime: "",
        gap: "",
        laps: "",
        
        // qualification
        bestLapTimeQ1: "",
        bestLapTimeQ2: "",
        bestLapTimeQ3: "",

        // race
        gapToLeaderBLR: "",
        gapToLeaderUKR: "",
        timeToDriverAhead: "",
        isFL: false,
        fastClass: "",
        points: 0,
    }
    switch (sessionType.template) {
        case "practice":
            driverData.bestLapTime = it[1].BestLapTime?.Value
            driverData.gap = it[1].TimeDiffToFastest
            driverData.laps = it[1].NumberOfLaps
            break
        case "qualification":
            const segment = sessionType.segment
            driverData.bestLapTimeQ1 = it[1].BestLapTimes[0]?.Value
            driverData.bestLapTimeQ2 = it[1].BestLapTimes[1]?.Value
            driverData.bestLapTimeQ3 = it[1].BestLapTimes[2]?.Value
            driverData.gap = it[1].Stats[segment]?.TimeDiffToFastest
            driverData.laps = it[1].NumberOfLaps
            break
        case "race":
            if (it[1].Stopped) {
                driverData.gapToLeaderBLR = "СЫХОД"
                driverData.gapToLeaderUKR = "СХІД"
                driverData.timeToDriverAhead = ""
            } else {
                const gap = translateLappedText(it[1].GapToLeader)
                driverData.gapToLeaderBLR = gap
                driverData.gapToLeaderUKR = gap
                driverData.timeToDriverAhead = translateLappedText(it[1].IntervalToPositionAhead?.Value)
            }
            driverData.isFL = false
            driverData.fastClass = ""
            driverData.points = (i < 10) ? sessionType.points[(i + 1)] : 0
    }
    return driverData
}

function prepareData(sessionType: SessionType) {
    let fastestLap = "9:99.999"
    let fastestPosition = 0
    // @ts-ignore
    const timingData = Object.assign({}, state.TimingData.Lines)
    const lines = Object.entries(timingData).sort(sortPosition)
        .map((it, i) => {
            const driverData = mapSourceDataToDriver(sessionType, it, i)
            if (sessionType.template === "race") {
                // @ts-ignore
                const currentFastLap = it[1].BestLapTime?.Value
                // @ts-ignore
                if (!it[1].Stopped && currentFastLap !== "" && currentFastLap < fastestLap) {
                    fastestLap = currentFastLap
                    fastestPosition = i
                }
            }
            return driverData;
        })
    if (sessionType.id === "race") {
        lines[fastestPosition].isFL = true
        lines[fastestPosition].fastClass = "fastLap"
        if (fastestPosition < 10) {
            lines[fastestPosition].points += 1
        }
    }

//    console.log("fastest lap: " + fastestLap + ", fastest: " + lines[fastestPosition].nameBLR)
//    console.log(lines)
    const currentRound = extractCurrentRound()
    return {
        drivers: lines,
        grandPrixNameBLR: currentRound.gpNameBLR,
        grandPrixNameUKR: currentRound.gpNameUKR,
        grandPrixFlag: currentRound.flag,
        fastestDriver: lines[fastestPosition],
        fastestLap: fastestLap
    }
}

async function convert(sessionData: any, language: Language, sessionType: SessionType) {
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()

    let templateFolder = "templates"
    if (language === Language.UKR) {
        templateFolder += "-ukr"
    }
    const html = await ejs.renderFile(templateFolder + "/" + sessionType.template + ".ejs", sessionData)
    //    await page.setContent(html, { waitUntil: 'load' });
    // @ts-ignore
    await page.setContent(html, {timeout: 0, waitUntil:'networkidle2'});
    //    await page.setContent(html)

    let pageWidth = 2500
    let pageHeight = 2680
    if (sessionType.template === "qualification") {
        pageWidth = 3000
    }
    if (sessionType.template === "race") {
        pageHeight = 2680
    }

    await page.setViewport({ width: pageWidth, height: pageHeight })
    const client = await page.createCDPSession();
    await client.send('Page.enable');
    await client.send('Page.setFontSizes', {
        fontSizes: {
            standard: 30,
            fixed: 50
        }
    })
    const screenshotName = "F1 " + timeConverter(Date.now()) + " "
            + sessionType.id + " - " + language + ".png"

    try {
        // Capture screenshot and save it in the current folder:
        const screenshotBuffer = await page.screenshot()
        return [screenshotBuffer, screenshotName]
    } catch (err) {
        console.log(`Error: ${err.message}`)
    } finally {
        await browser.close();
        console.log(`Screenshot has been captured successfully`)
    }
}

const app = express()
const port = 3000
app.use(bodyParser.json())
app.use(express.static('public'))

const signalrUrl = "livetiming.formula1.com/signalr";
const signalrHub = "Streaming";

const socketFreq = 250;
const retryFreq = 10000;

let messageCount = 0;
let emptyMessageCount = 0;

const deepObjectMerge = (original = {}, modifier) => {
    if (!modifier) return original;
    const copy = { ...original };
    for (const [key, value] of Object.entries(modifier)) {
        const valueIsObject =
      typeof value === "object" && !Array.isArray(value) && value !== null;
        if (valueIsObject && !!Object.keys(value).length) {
            copy[key] = deepObjectMerge(copy[key], value);
        } else {
            copy[key] = value;
        }
    }
    return copy;
};

const parseCompressed = (data) =>
  JSON.parse(zlib.inflateRawSync(Buffer.from(data, "base64")).toString());


const updateState = (data) => {
    try {
        const parsed = JSON.parse(data.toString());

        if (!Object.keys(parsed).length) emptyMessageCount++;
        else emptyMessageCount = 0;

//        if (emptyMessageCount > 15) {
//            console.log ("Cleaning state - 15 empty messages")
//            state = {};
//            messageCount = 0;
//        }

        if (Array.isArray(parsed.M)) {
            for (const message of parsed.M) {
                if (message.M === "feed") {
                    messageCount++;

                    let [field, value] = message.A;

                    if (field === "CarData.z" || field === "Position.z") {
                        const [parsedField] = field.split(".");
                        field = parsedField;
                        value = parseCompressed(value);
                    }

                    state = deepObjectMerge(state, { [field]: value });
                }
            }
        } else if (Object.keys(parsed.R ?? {}).length && parsed.I === "1") {
            messageCount++;

            if (parsed.R["CarData.z"])
                parsed.R["CarData"] = parseCompressed(parsed.R["CarData.z"]);

            if (parsed.R["Position.z"])
                parsed.R["Position"] = parseCompressed(parsed.R["Position.z"]);

            state = deepObjectMerge(state, parsed.R);
        }
//        console.log("Updated F1 state")
        //        console.log(state)
    } catch (e) {
        console.error(`could not update data: ${e}`);
    }
};

let socket = null

const setupStream = async (wss) => {
    console.log(`[${signalrUrl}] Connecting to live timing stream`);

    const hub = encodeURIComponent(JSON.stringify([{ name: signalrHub }]));
    const negotiation = await fetch(
        `https://${signalrUrl}/negotiate?connectionData=${hub}&clientProtocol=1.5`
        );
    const cookie =
    negotiation.headers.get("Set-Cookie") ??
    negotiation.headers.get("set-cookie");
    const { ConnectionToken } = await negotiation.json();

    if (cookie && ConnectionToken) {
        console.log(`[${signalrUrl}] HTTP negotiation complete`);

        // noinspection JSPotentiallyInvalidConstructorUsage
        socket = new ws(
            `wss://${signalrUrl}/connect?clientProtocol=1.5&transport=webSockets&connectionToken=${encodeURIComponent(
                ConnectionToken
                )}&connectionData=${hub}`,
            [],
            {
                headers: {
                    "User-Agent": "BestHTTP",
                    "Accept-Encoding": "gzip,identity",
                    Cookie: cookie,
                },
            }
            );

        socket.on("open", () => {
            console.log(`[${signalrUrl}] WebSocket open`);

            state = {};
            messageCount = 0;
            emptyMessageCount = null;

            socket.send(
                JSON.stringify({
                    H: signalrHub,
                    M: "Subscribe",
                    A: [
                        [
                            "Heartbeat",
                            //                            "CarData.z",
                            //                            "Position.z",
                            "ExtrapolatedClock",
                            "TimingStats",
                            "TimingAppData",
                            //                            "WeatherData",
                            "TrackStatus",
                            //                            "DriverList",
                            //                            "RaceControlMessages",
                            "SessionInfo",
                            "SessionData",
                            "LapCount",
                            "TimingData",
                            //                            "TeamRadio",
                            ],
                        ],
                    I: 1,
                })
                );
        });

        socket.on("message", (data) => {
            updateState(data);
        });

        socket.on("error", () => {
            console.log("socket error");
            socket.close();
        });

        socket.on("close", () => {
            console.log("socket close");
            state = {};
            messageCount = 0;
            emptyMessageCount = null;

            setTimeout(() => {
                setupStream(wss);
            }, retryFreq);
        });
    } else {
        console.log(
            `[${signalrUrl}] HTTP negotiation failed. Is there a live session?`
            );
        state = {};
        messageCount = 0;

        setTimeout(() => {
            setupStream(wss);
            }, retryFreq);
    }
};

const wss = new ws.WebSocketServer({ noServer: true });

function sendImageToUser(ctx) {
    return screenshot => ctx.replyWithDocument({source: screenshot[0], filename: screenshot[1]});
}

function extractDriverName(language: Language, driver) {
    return language === Language.BLR ? driver.nameBLR : driver.nameUKR;
}

function createDriversList(sessionData: any, sessionType: SessionType, language: Language): string {
    return "" + sessionData.drivers
        .map((driver, i: number) => {
            return (i+1) + ". " + extractDriverName(language, driver)
        })
        .slice(sessionType.takeFrom, sessionType.takeTo)
        .reduce((a: string, b: string) => a + "\n" + b)
}

async function notifyAdmin(message: string) {
    await bot.telegram.sendMessage(ADMIN_ID, message)
}

function extractUserId(ctx: Context<any>) {
    return ctx.update?.message?.from.id + "";
}

async function createAndSendScreenshots(ctx: Context<any>, sessionType: SessionType) {
    try {
        const userId = extractUserId(ctx)
        const message = "Карыстальнік " + userId + " запытаў вынікі для " + sessionType.id
        console.log(message)
        let language = Language.BLR
        if (userId !== ADMIN_ID) {
            language = Language.UKR
            await notifyAdmin(message)
        }

        const sessionData = prepareData(sessionType);
        let replyText: string
        if (language === Language.BLR) {
            const driversOutLabel = sessionType.isShootoutSession() ? "Не праходзяць далей:\n" : ""
            replyText = "🏁 " + sessionType.nameBLR.slice(0, 1)
                + sessionType.nameBLR.slice(1).toLowerCase() + ": вынікі!\n\n"
                + driversOutLabel +
                + createDriversList(sessionData, sessionType, Language.BLR)
                + "\n\n" + extractCurrentRound().hashtag
        } else {
            replyText = createDriversList(sessionData, sessionType, language)
        }
        await ctx.reply(replyText)

        // @ts-ignore
        sessionData.sessionNameBLR = sessionType.nameBLR
        // @ts-ignore
        sessionData.sessionNameUKR = sessionType.nameUKR

        if (userId === ADMIN_ID) {
            await convert(sessionData, Language.BLR, sessionType)
                .then(sendImageToUser(ctx))
        }
        await convert(sessionData, Language.UKR, sessionType)
            .then(sendImageToUser(ctx))
    } catch (err) {
        console.log(`Error: ${err.message}`)
        ctx.reply(`Адбылася памылка:\n\n${err.message}`)
    }
}

bot.command('race', async (ctx) => {
    await createAndSendScreenshots(ctx, sessionTypes.race)
})

bot.command('sprint', async (ctx) => {
    await createAndSendScreenshots(ctx, sessionTypes.sprint)
})

bot.command('fp1', async (ctx) => {
    await createAndSendScreenshots(ctx, sessionTypes.fp1)
})

bot.command('fp2', async (ctx) => {
    await createAndSendScreenshots(ctx, sessionTypes.fp2)
})

bot.command('fp3', async (ctx) => {
    await createAndSendScreenshots(ctx, sessionTypes.fp3)
})

bot.command('q1', async (ctx) => {
    await createAndSendScreenshots(ctx, sessionTypes.q1)
})

bot.command('q2', async (ctx) => {
    await createAndSendScreenshots(ctx, sessionTypes.q2)
})

bot.command('q3', async (ctx) => {
    await createAndSendScreenshots(ctx, sessionTypes.q3)
})

bot.command('sq1', async (ctx) => {
    await createAndSendScreenshots(ctx, sessionTypes.sq1)
})

bot.command('sq2', async (ctx) => {
    await createAndSendScreenshots(ctx, sessionTypes.sq2)
})

bot.command('sq3', async (ctx) => {
    await createAndSendScreenshots(ctx, sessionTypes.sq3)
})

function createJsonBuffer(json: any) {
    return Buffer.from(JSON.stringify(json), 'utf8')
}

bot.command('debugTad', async (ctx) => {
    const userId = extractUserId(ctx)
    if (userId === ADMIN_ID) {
        let json = state['TimingAppData']
        bot.telegram.sendDocument(userId, {
            source: createJsonBuffer(json),
            filename: "debug-TimingAppData-" + Date.now() + ".json"
        })
    }
})

bot.command('debug', async (ctx) => {
    const userId = extractUserId(ctx)
    if (userId === ADMIN_ID) {
        bot.telegram.sendDocument(userId, {
            source: createJsonBuffer(state),
            filename: "debug-" + Date.now() + ".json",
        })
    }
})

bot.command('reconnect', async (ctx) => {
    await socket.close()
    ctx.reply("Websocket connection restarted")
})

bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

app.listen(port, async () => {

    // Assume we have an active session after 5 messages
    let active;

    setInterval(() => {
        active = messageCount > 5;
        wss.clients.forEach((s) => {
            if (s.readyState === ws.OPEN) {
                s.send(active ? JSON.stringify(state) : "{}", {
                    binary: false,
                });
            }
        });
        }, socketFreq);

    await setupStream(wss);
    console.log(`Converter app listening on port ${port}`)
})
