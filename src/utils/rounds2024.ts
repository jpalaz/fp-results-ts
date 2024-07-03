export class RoundInfo2024 {
    gpNameBLR: string
    gpNameUKR: string
    flag: string
    fromDate: Date
    hashtag: string

    constructor(gpNameBLR: string, gpNameUKR: string, flag: string, dayMonth: string, hashtag: string) {
        this.gpNameBLR = gpNameBLR
        this.gpNameUKR = gpNameUKR
        this.flag = flag
        this.fromDate = new Date("2024-" + dayMonth)
        this.hashtag = hashtag
    }
}

export function extractCurrentRound() {
    const now = new Date()
    // @ts-ignore
    return rounds.findLast((it: RoundInfo2024) => now > it.fromDate)
}

export const rounds = [
    new RoundInfo2024('ГП Бахрэйну', "ГП Австралії", "bh", "02-29", "#BahrainGP"),
    new RoundInfo2024('ГП Саўдаўскай Аравіі', "ГП Австралії", "sa", "03-07", "#SaudiArabianGP"),
    new RoundInfo2024('ГП Аўстраліі', "ГП Австралії", "au", "03-22", "#AustralianGP"),
    new RoundInfo2024("ГП Японіі", "ГП Японії", "jp", "04-05", "#JapaneseGP"),
    new RoundInfo2024("ГП Кітаю", "ГП Китаю", "cn", "04-19", "#ChineseGP"),
    new RoundInfo2024("ГП Маямі", "ГП Маямі", "us", "05-03", "#MiamiGP"),
    new RoundInfo2024("ГП Эміліі-Раманьі", "ГП Емілії-Романьї", "it", "05-17", "#ImolaGP"),
    new RoundInfo2024("ГП Манака", "ГП Монако", "mc", "05-24", "#MonacoGP"),
    new RoundInfo2024("ГП Канады", "ГП Канади", "ca", "06-07", "#CanadianGP"),
    new RoundInfo2024("ГП Гішпаніі", "ГП Іспанії", "es", "06-21", "#SpanishGP"),
    new RoundInfo2024("ГП Аўстрыі", "ГП Австрії", "at", "06-28", "#AustrianGP"),
    new RoundInfo2024("ГП Вялікай Брытаніі", "ГП Великої Британії", "gb", "07-05", "#BritishGP"),
    new RoundInfo2024("ГП Вугоршчыны", "ГП Угорщини", "hu", "07-19", "#HungarianGP"),
    new RoundInfo2024("ГП Бельгіі", "ГП Бельгії", "be", "07-26", "#BelgianGP"),
    new RoundInfo2024("ГП Нідэрландаў", "ГП Нідерландів", "nl", "08-23", "#DutchGP"),
    new RoundInfo2024("ГП Італіі", "ГП Італії", "it", "08-30", "#ItalianGP"),
    new RoundInfo2024("ГП Азербайджану", "ГП Азербайджану", "az", "09-13", "#AzerbaijanGP"),
    new RoundInfo2024("ГП Сінгапуру", "ГП Сінгапуру", "sg", "09-20", "#SingaporeGP"),
    new RoundInfo2024("ГП ЗША", "ГП США", "us", "10-18", "#TBD"),
    new RoundInfo2024("ГП Мексікі", "ГП Мексики", "mx", "10-25", "#TBD"),
    new RoundInfo2024("ГП Бразіліі", "ГП Бразилії", "br", "11-01", "#TBD"),
    new RoundInfo2024("ГП Лас-Вегаса", "ГП Лас-Вегаса", "us", "11-21", "#TBD"),
    new RoundInfo2024("ГП Катару", "ГП Катару", "qa", "11-29", "#TBD"),
    new RoundInfo2024("ГП Абу-Дабі", "ГП Абу-Дабі", "ae", "10-06", "#TBD"),
]
