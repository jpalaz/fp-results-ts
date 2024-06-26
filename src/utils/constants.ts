export const RACE_POINTS = {
    1: 25, 2: 18, 3: 15, 4: 12, 5: 10,
    6: 8, 7: 6, 8: 4, 9: 2, 10: 1,
}

export const SPRINT_POINTS = {
    1: 8, 2: 7, 3: 6, 4: 5,
    5: 4, 6: 3, 7: 2, 8: 1,
    9: 0, 10: 0,
}

export enum Language {
    BLR,
    UKR,
}

export class SessionType {
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

    isShootoutSession() {
        return this.id === "Q1" || this.id === "SQ1" || this.id === "Q2" || this.id === "SQ2"
    }

    get takeFrom() {
        if (this.id === "Q1" || this.id === "SQ1") {
            return 15
        } else if (this.id === "Q2" || this.id === "SQ2") {
            return 10
        } else if (this.id === "Q3" || this.id === "SQ3") {
            return 0
        } else {
            return 0
        }
    }

    get takeTo() {
        if (this.id === "Q1" || this.id === "SQ1") {
            return 20
        } else if (this.id === "Q2" || this.id === "SQ2") {
            return 15
        } else if (this.id === "Q3" || this.id === "SQ3") {
            return 10
        } else {
            return 10
        }
    }
}

export const sessionTypes = {
    q1: new SessionType('КВАЛІФІКАЦЫЯ - 1 СЕГМЕНТ', 'КВАЛІФІКАЦІЯ - 1', "qualification", "Q1"),
    q2: new SessionType('КВАЛІФІКАЦЫЯ - 2 СЕГМЕНТ', 'КВАЛІФІКАЦІЯ - 2', "qualification", "Q2"),
    q3: new SessionType('КВАЛІФІКАЦЫЯ - ФІНАЛ', 'КВАЛІФІКАЦІЯ', "qualification", "Q3"),
    sq1: new SessionType('СПРЫНТ КВАЛІФІКАЦЫЯ - 1', 'СПРИНТ КВАЛІФІКАЦІЯ - 1', "qualification", "SQ1"),
    sq2: new SessionType('СПРЫНТ КВАЛІФІКАЦЫЯ - 2', 'СПРИНТ КВАЛІФІКАЦІЯ - 2', "qualification", "SQ2"),
    sq3: new SessionType('СПРЫНТ КВАЛІФІКАЦЫЯ', 'СПРИНТ КВАЛІФІКАЦІЯ', "qualification", "SQ3"),
    race: new SessionType('ГОНКА', 'ГОНКА', "race", "race"),
    sprint: new SessionType('СПРЫНТ', 'СПРИНТ', "race", "sprint"),
    fp1: new SessionType('ПРАКТЫКА 1', 'ПРАКТИКА 1', "practice", "FP1"),
    fp2: new SessionType('ПРАКТЫКА 2', 'ПРАКТИКА 2', "practice", "FP2"),
    fp3: new SessionType('ПРАКТЫКА 3', 'ПРАКТИКА 3', "practice", "FP3"),
};
