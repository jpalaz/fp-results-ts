export class RoundInfo2024 {
    gpNameBLR: string
    gpNameUKR: string
    flag: string
    day: number
    month: number
    hashtag: string

    constructor(gpNameBLR: string, gpNameUKR: string, flag: string, day: number, month: number, hashtag: string) {
        this.gpNameBLR = gpNameBLR
        this.gpNameUKR = gpNameUKR
        this.flag = flag
        this.day = day
        this.month = month
        this.hashtag = hashtag
    }
}

export function extractCurrentRound() {
    const now = new Date()
    // @ts-ignore
    return rounds.findLast((it: RoundInfo2024) => it.day <= now.getDate() && it.month <= (now.getMonth() + 1))
}

export const rounds = [
    new RoundInfo2024('ГП Бахрэйну', "ГП Австралії", "bh", 29, 2, "#BahrainGP"),
    new RoundInfo2024('ГП Саўдаўскай Аравіі', "ГП Австралії", "sa", 7, 3, "#SaudiArabianGP"),
    new RoundInfo2024('ГП Аўстраліі', "ГП Австралії", "au", 22, 3, "#AustralianGP"),
    new RoundInfo2024("ГП Японіі", "ГП Японії", "jp", 5, 4, "#JapaneseGP"),
    new RoundInfo2024("ГП Кітаю", "ГП Китаю", "cn", 19, 4, "#ChineseGP"),
    new RoundInfo2024("ГП Маямі", "ГП Маямі", "us", 3, 5, "#MiamiGP"),
    new RoundInfo2024("ГП Эміліі-Раманьі", "ГП Емілії-Романьї", "it", 17, 5, "#ImolaGP"),
    new RoundInfo2024("ГП Манака", "ГП Монако", "mc", 24, 5, "#MonacoGP"),
    new RoundInfo2024("ГП Канады", "ГП Канади", "ca", 7, 6, "#CanadianGP"),
    new RoundInfo2024("ГП Гішпаніі", "ГП Іспанії", "es", 21, 6, "#SpanishGP"),
    new RoundInfo2024("ГП Аўстрыі", "ГП Австрії", "at", 28, 6, "#AustrianGP"),
//  new RoundInfo2024("ГП Вялікабрытаніі", "ГП Великої Британії", "it", 5, 7, "#BritishGP"),
    new RoundInfo2024("ГП Вялікай Брытаніі", "ГП Великої Британії", "gb", 5, 7, "#BritishGP"),
    new RoundInfo2024("ГП Вугоршчыны", "ГП Угорщини", "hu", 19, 7, "#HungarianGP"),
    new RoundInfo2024("ГП Бельгіі", "ГП Бельгії", "be", 26, 7, "#BelgianGP"),
    new RoundInfo2024("ГП Нідэрландаў", "ГП Нідерландів", "nl", 23, 8, "#DutchGP"),
    new RoundInfo2024("ГП Італіі", "ГП Італії", "it", 30, 8, "#ItalianGP"),
    new RoundInfo2024("ГП Азербайджану", "ГП Азербайджану", "az", 13, 9, "#AzerbaijanGP"),
    new RoundInfo2024("ГП Сінгапуру", "ГП Сінгапуру", "sg", 20, 9, "#SingaporeGP"),
    new RoundInfo2024("ГП ЗША", "ГП США", "us", 18, 10, "#BahrainGP"),
    new RoundInfo2024("ГП Мексікі", "ГП Мексики", "mx", 25, 10, "#BahrainGP"),
    new RoundInfo2024("ГП Бразіліі", "ГП Бразилії", "br", 1, 11, "#BahrainGP"),
    new RoundInfo2024("ГП Лас-Вегаса", "ГП Лас-Вегаса", "us", 21, 11, "#BahrainGP"),
    new RoundInfo2024("ГП Катару", "ГП Катару", "qa", 29, 11, "#BahrainGP"),
    new RoundInfo2024("ГП Абу-Дабі", "ГП Абу-Дабі", "ae", 6, 12, "#BahrainGP"),
]
