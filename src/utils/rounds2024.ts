export class RoundInfo2024 {
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

export const rounds = [
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
