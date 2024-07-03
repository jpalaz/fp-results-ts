export class Driver {
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
    "1": new Driver("Макс Верстапен", "Макс Ферстаппен", 1),
    "11": new Driver("Серхіа Перэс", "Серхіо Перес", 1),
    "63": new Driver("Джордж Расэл", "Джордж Расселл", 2),
    "44": new Driver("Льюіс Гэмілтан", "Льюїс Хемілтон", 2),
    "55": new Driver("Карлас Сайнц", "Карлос Сайнс", 3),
    "16": new Driver("Шарль Леклер", "Шарль Леклер", 3),
    "4": new Driver("Ланда Норыс", "Ландо Норріс", 4),
    "81": new Driver("Оскар Піястры", "Оскар Піастрі", 4),

    "14": new Driver("Фернанда Алонса", "Фернандо Алонсо", 5),
    "18": new Driver("Лэнс Строл", "Ленс Стролл", 5),
    "10": new Driver("П'ер Гаслі", "П'єр Гаслі", 6),
    "31": new Driver("Эстэбан Акон", "Естебан Окон", 6),
    "23": new Driver("Алекс Албан", "Алекс Албон", 7),
    "2": new Driver("Логан Сарджэнт", "Логан Сарджент", 7),
    "3": new Driver("Даніэль Рык'ярда", "Даніель Ріккардо", 8),
    "22": new Driver("Юкі Цунода", "Юкі Цунода", 8),

    "77": new Driver("Вальтэры Ботас", "Вальтері Боттас", 9),
    "24": new Driver("Гуанью Чжоў", "Гуанью Чжоу", 9),
    "27": new Driver("Ніка Хюлкенберг", "Ніко Хюлькенберг", 10),
    "20": new Driver("Кевін Магнусэн", "Кевін Магнуссен", 10),
}

class ReserveDriverName {
    nameBLR: string
    nameUKR: string

    constructor(nameBLR: string, nameUKR: string) {
        this.nameBLR = nameBLR
        this.nameUKR = nameUKR
    }
}

const REPLACEMENTS = {
    "Bearman": new ReserveDriverName("Олівер Берман", "Олівер Берман"),
    "Iwasa": new ReserveDriverName("Аюму Іваса", "Аюму Іваса"),
    "Doohan": new ReserveDriverName("Джэк Дуэн", "Джек Дуейн"),
    "Colapinto": new ReserveDriverName("Франка Калапінта", "Франко Колапінто"),
    "Hadjar": new ReserveDriverName("Ісак Хаджар", "Ісак Хаджар"),
}

const teamIdByNames = new Map<string, number>([
    ["Red Bull Racing", 1],
    ["Mercedes", 2],
    ["Ferrari", 3],
    ["McLaren", 4],
    ["Aston Martin", 5],
    ["Alpine", 6],
    ["Williams", 7],
    ["RB", 8],
    ["Kick Sauber", 9],
    ["Haas F1 Team", 10],
])

export function convertReplacementToDriver(driverLastName: string, teamName: string): Driver {
    const replacement = REPLACEMENTS[driverLastName]
    const nameOrUnknown = replacement != null ? replacement : new ReserveDriverName("??? Невядомы", "???")
    return new Driver(nameOrUnknown.nameBLR, nameOrUnknown.nameUKR, teamIdByNames.get(teamName))
}