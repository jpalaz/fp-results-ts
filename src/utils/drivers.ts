export class DriverName {
    nameBLR: string
    nameUKR: string
    teamId: number

    constructor(nameBLR: string, nameUKR: string, teamId: number) {
        this.nameBLR = nameBLR
        this.nameUKR = nameUKR
        this.teamId = teamId
    }
}

export const DRIVER_NAMES = {
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
    "??": new DriverName("Олівер Берман &#128257;", "Олівер Берман &#128257;", 10),
    // "??": new DriverName("Джэк Дуэн", "Джек Дуейн", 6),
}

export const fp1Replacements = {}
