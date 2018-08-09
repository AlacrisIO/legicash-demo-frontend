import { List, Record } from 'immutable'
import { SortedList } from './sorted_list'

interface IDate { date: Date }

class DateR extends Record({ date: new Date }) implements IDate {
    public date: Date
    constructor(time: number | Date) {
        super({ date: (time instanceof Date) ? time : new Date(time) })
    }
}

const start = new Date(1000, 1, 1).getTime()
const end = new Date(3000, 1, 1).getTime()
const duration = end - start
const randomDate = (): DateR => new DateR(start + Math.random() * duration)

const dates: DateR[] = []
const numDates = 6
for (let i = 0; i < numDates; i++) { dates.push(randomDate()) }
const elements = List(dates)  // Randomized order
const keyFn = (d: DateR) => d.date
const cmp = (d1: DateR, d2: DateR) =>
    (d1.date < d2.date ? -1 : (d1.date > d2.date) ? 1 : 0)

describe('SortedList tests', () => {
    it('Sorts a list as expected', () => {
        const s = new SortedList({ elements, keyFn })
        const ndates = dates.slice()
        ndates.sort(cmp)
        expect(s.elements.toArray()).toEqual(ndates)
    })
    it("Adds a new element in the expected location, and knows it's there", () => {
        let s = new SortedList({ elements, keyFn })
        const ndates = dates.slice()
        for (let i = 0; i < 10; i++) {
            const nd = randomDate()
            s = s.add(nd)
            ndates.push(nd)
            ndates.sort(cmp)
            expect(s.elements.toArray()).toEqual(ndates)
            expect(s.hasElt(nd, nd.date)).toBeTruthy()
            const rd = randomDate()
            expect(s.hasElt(rd, rd.date)).toBeFalsy()
            expect(s.lSize).toEqual(elements.size + i + 1)
        }
    })
})
