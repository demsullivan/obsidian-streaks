import { RRule } from 'rrule';
import type { Moment } from 'moment';

export default class Streak {
	public readonly startDate: Moment | null;

	private rrule: RRule;
	private dates: Moment[] = [];

	constructor({ startDate, rrule }: { startDate: Moment | null, rrule: RRule }) {
		this.startDate = startDate;
		this.rrule     = rrule;
		this.dates     = [this.startDate];
	}

	get length(): number {
		return this.dates.length;
	}

	public continues(moment: Moment): boolean {
		const expectedDate = window.moment(
			this.rrule.after(this.dates.last().toDate())
		);

		return expectedDate.isSame(moment);
	}

	public addDate(moment: Moment): void {
		if (!this.continues(moment)) return;
		this.dates.push(moment);
	}
}
