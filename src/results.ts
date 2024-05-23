import puppeteer from 'puppeteer'
import express from 'express'
import bodyParser from 'body-parser'
import ejs from "ejs"
import ws from "ws"
import zlib from "zlib"
import {Telegraf} from 'telegraf'

const bot = new Telegraf(process.env.BOT_TOKEN)

const RACE_POINTS = {
    1: 25, 2: 18, 3: 15, 4: 12, 5: 10,
    6: 8, 7: 6, 8: 4, 9: 2, 10: 1,
}

const SPRINT_POINTS = {
    1: 8, 2: 7, 3: 6, 4: 5,
    5: 4, 6: 3, 7: 2, 8: 1,
    9: 0, 10: 0,
}

class SessionType {
    nameBLR: string
    nameUKR: string
    template: string
    id: string

    constructor(name: string, nameUKR: string, template: string, id: string) {
        this.nameBLR = name
        this.nameUKR = nameUKR
        this.template = template
        this.id = id
    }

    get points() {
        if (this.id === "race") {
            return RACE_POINTS
        } else if (this.id === "sprint") {
            return SPRINT_POINTS
        }
    }

    get segment() {
        if (this.id === "Q1" || this.id === "SQ1") {
            return 0
        } else if (this.id === "Q2" || this.id === "SQ2") {
            return 1
        } else if (this.id === "Q3" || this.id === "SQ3") {
            return 2
        }
    }
}

const sessionTypes = {
    q1: new SessionType('КВАЛІФІКАЦЫЯ - 1', 'КВАЛІФІКАЦІЯ - 1', "qualification", "Q1"),
    q2: new SessionType('КВАЛІФІКАЦЫЯ - 2', 'КВАЛІФІКАЦІЯ - 2', "qualification", "Q2"),
    q3: new SessionType('КВАЛІФІКАЦЫЯ', 'КВАЛІФІКАЦІЯ', "qualification", "Q3"),
    sq1: new SessionType('СПРЫНТ КВАЛІФІКАЦЫЯ - 1', 'СПРИНТ КВАЛІФІКАЦІЯ - 1', "qualification", "SQ1"),
    sq2: new SessionType('СПРЫНТ КВАЛІФІКАЦЫЯ - 2', 'СПРИНТ КВАЛІФІКАЦІЯ - 2', "qualification", "SQ2"),
    sq3: new SessionType('СПРЫНТ КВАЛІФІКАЦЫЯ', 'СПРИНТ КВАЛІФІКАЦІЯ', "qualification", "SQ3"),
    race: new SessionType('ГОНКА', 'ГОНКА', "race", "race"),
    sprint: new SessionType('СПРЫНТ', 'СПРИНТ', "race", "sprint"),
    fp1: new SessionType('ВОЛЬНАЯ ПРАКТЫКА 1', 'ПРАКТИКА 1', "practice", "FP1"),
    fp2: new SessionType('ВОЛЬНАЯ ПРАКТЫКА 2', 'ПРАКТИКА 2', "practice", "FP2"),
    fp3: new SessionType('ВОЛЬНАЯ ПРАКТЫКА 3', 'ПРАКТИКА 3', "practice", "FP3"),
};

const sortPosition = (a: any, b: any) => {
    const [, aLine] = a;
    const [, bLine] = b;
    const aPos = Number(aLine.Position);
    const bPos = Number(bLine.Position);
    return aPos - bPos;
};

class DriverName {
    nameBLR: string
    nameUKR: string
    teamId: number

    constructor(nameBLR: string, nameUKR: string, teamId: number) {
        this.nameBLR = nameBLR
        this.nameUKR = nameUKR
        this.teamId = teamId
    }
}

const DRIVER_NAMES = {
    "1": new DriverName("Макс Верстапен", "Макс Ферстаппен", 1),
    "11": new DriverName("Серхіа Перэс", "Серхіо Перес", 1),
    "63": new DriverName("Джордж Расэл", "Джордж Расселл", 2),
    "44": new DriverName("Льюіс Гэмілтан", "Льюїс Хемілтон", 2),
    "55": new DriverName("Карлас Сайнц", "Карлос Сайнс", 3),
    "16": new DriverName("Шарль Леклер", "Шарль Леклер", 3),
//    "38": new DriverName("Олівер Берман", "Олівер Берман", 3),
    "4": new DriverName("Ланда Норыс", "Ландо Норріс", 4),
    "81": new DriverName("Оскар Піястры", "Оскар Піастрі", 4),
    "14": new DriverName("Фернанда Алонса", "Фернандо Алонсо", 5),
    "18": new DriverName("Лэнс Строл", "Ленс Стролл", 5),
    "10": new DriverName("П'ер Гаслі", "П'єр Гаслі", 6),
    "31": new DriverName("Эстэбан Акон", "Естебан Окон", 6),
    "23": new DriverName("Алекс Албан", "Алекс Албон", 7),
    "2": new DriverName("Логан Сарджэнт", "Логан Сарджент", 7),
    "3": new DriverName("Даніэль Рык'ярда", "Даніель Ріккардо", 8),
    "22": new DriverName("Юкі Цунода", "Юкі Цунода", 8),
//    "??": new DriverName("Аюму Іваса 🔁", "Аюму Іваса 🔁", 8),
    "77": new DriverName("Вальтэры Ботас", "Вальтері Боттас", 9),
    "24": new DriverName("Гуанью Чжоў", "Гуанью Чжоу", 9),
    "27": new DriverName("Ніка Хюлкенберг", "Ніко Хюлькенберг", 10),
    "20": new DriverName("Кевін Магнусэн", "Кевін Магнуссен", 10),
    "??": new DriverName("Олівер Берман 🔁", "Олівер Берман 🔁", 10),
}

class RoundInfo2024 {
    gpNameBLR: string
    gpNameUKR: string
    flag: string
    day: number
    month: number

    constructor(gpNameBLR: string, gpNameUKR: string, flag: string, day: number, month: number) {
        this.gpNameBLR = gpNameBLR
        this.gpNameUKR = gpNameUKR
        this.flag = flag
        this.day = day
        this.month = month
    }
}

const rounds = [
    new RoundInfo2024('ГП Бахрэйну', "ГП Австралії", "bh", 29, 2),
    new RoundInfo2024('ГП Саўдаўскай Аравіі', "ГП Австралії", "sa", 7, 3),
    new RoundInfo2024('ГП Аўстраліі', "ГП Австралії", "au", 22, 3),
    new RoundInfo2024("ГП Японіі", "ГП Японії", "jp", 5, 4),
    new RoundInfo2024("ГП Кітаю", "ГП Китаю", "cn", 19, 4),
    new RoundInfo2024("ГП Маямі", "ГП Маямі", "us", 3, 5),
    new RoundInfo2024("ГП Эміліі-Раманьі", "ГП Емілії-Романьї", "it", 17, 5),
    new RoundInfo2024("ГП Манака", "ГП Монако", "mc", 24, 5),
    new RoundInfo2024("ГП Канады", "ГП Канади", "ca", 7, 6),
    new RoundInfo2024("ГП Гішпаніі", "ГП Іспанії", "es", 21, 6),
    new RoundInfo2024("ГП Аўстрыі", "ГП Австрії", "at", 28, 6),
//  new RoundInfo2024("ГП Вялікабрытаніі", "ГП Великої Британії", "it", 5, 7),
    new RoundInfo2024("ГП Вялікай Брытаніі", "ГП Великої Британії", "gb", 5, 7),
    new RoundInfo2024("ГП Вугоршчыны", "ГП Угорщини", "hu", 19, 7),
    new RoundInfo2024("ГП Бельгіі", "ГП Бельгії", "be", 26, 7),
    new RoundInfo2024("ГП Нідэрландаў", "ГП Нідерландів", "nl", 23, 8),
    new RoundInfo2024("ГП Італіі", "ГП Італії", "it", 30, 8),
    new RoundInfo2024("ГП Азербайджану", "ГП Азербайджану", "az", 13, 9),
    new RoundInfo2024("ГП Сінгапуру", "ГП Сінгапуру", "sg", 20, 9),
    new RoundInfo2024("ГП ЗША", "ГП США", "us", 18, 10),
    new RoundInfo2024("ГП Мексікі", "ГП Мексики", "mx", 25, 10),
    new RoundInfo2024("ГП Бразіліі", "ГП Бразилії", "br", 1, 11),
    new RoundInfo2024("ГП Лас-Вегаса", "ГП Лас-Вегаса", "us", 21, 11),
    new RoundInfo2024("ГП Катару", "ГП Катару", "qa", 29, 11),
    new RoundInfo2024("ГП Абу-Дабі", "ГП Абу-Дабі", "ae", 6, 12),
]

function extractCurrentRound() {
    const now = new Date()
    // @ts-ignore
    return rounds.findLast((it: RoundInfo2024) => it.day <= now.getDate() && it.month <= (now.getMonth() + 1))
}

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
    const driver = knownDriver != null ? knownDriver : DRIVER_NAMES["??"]
    const driverData = {
        nameBLR: driver.nameBLR,
        nameUKR: driver.nameUKR,
        teamId: driver.teamId,

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

    console.log("fastest lap: " + fastestLap + ", fastest: " + lines[fastestPosition].nameBLR)
    console.log(lines)
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

async function convert(sessionData: any, language: string, sessionType: SessionType) {
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()

    let templateFolder = "templates"
    if (language === "UKR") {
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
    const client = await page.target().createCDPSession();
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

function withLeadingZero(number: number) {
    return number < 10 ? ("0" + number) : ("" + number); 
}

function timeConverter(UNIX_timestamp) {
    const a = new Date(UNIX_timestamp);
    const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    const year = a.getFullYear();
    const month = months[a.getMonth()];
    const date = a.getDate();
    const hour = a.getHours();
    const min = a.getMinutes();
    const sec = a.getSeconds();
    return year + '-' + month + '-' + withLeadingZero(date) + ' '
        + withLeadingZero(hour) + '-'  + withLeadingZero(min) + '-'  + withLeadingZero(sec)
}

const app = express()
const port = 3000
app.use(bodyParser.json())
app.use(express.static('public'))

function sendImage(res, png) {
    return res.contentType("image/png").send(png);
}

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

function createDriversList(sessionData) {
    return sessionData.drivers.map((driver, i) => {
        return (i+1) + ". " + driver.nameBLR + "\n"
    })
    .reduce((a, b) => a + b)
}

async function createAndSendScreenshots(ctx, sessionType: SessionType) {
    try {
        const sessionData = prepareData(sessionType);
        // @ts-ignore
        sessionData.sessionNameBLR = sessionType.nameBLR
        // @ts-ignore
        sessionData.sessionNameUKR = sessionType.nameUKR
        
        ctx.reply(createDriversList(sessionData))
        
        await convert(sessionData, "BLR", sessionType)
            .then(sendImageToUser(ctx))
        await convert(sessionData, "UKR", sessionType)
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
