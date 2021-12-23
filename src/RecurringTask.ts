import { RRule } from 'rrule';
import _ from 'lodash';

import type { Task } from 'obsidian-tasks/src/Task';

import Streak from './Streak';

export default class RecurringTask {
	public name: string;
	private instances: Task[] = [];
	private rrule: RRule;
	private streaks: Streak[];

	constructor(name: string, instances: Task[] = []) {
		this.name      = name;
		this.instances = instances;

		this.recache();
	}

	public addInstance(instance: Task): void {
		this.instances.push(instance);
		this.recache();
	}

	public getLatestStreak(): Streak {
		if (this.streaks.length == 0) this.calculateStreaks();
		return this.streaks.last();
	}

	public getStreaks(): Streak[] {
		if (this.streaks.length == 0) this.calculateStreaks();
		return this.streaks;
	}

	private calculateStreaks(): void {
		const actualDates = this.instances.map((t: Task) => t.doneDate);

		this.streaks = _.reduce(actualDates, (streaks: Streak[], date: Date, index: number, dates: Date[]) => {
			const currentDate = window.moment(date);
			const currentStreak = streaks.last();

			if (currentStreak === undefined || !currentStreak.continues(currentDate)) {
				streaks.push(new Streak({ startDate: currentDate, rrule: this.rrule }));
			} else {
				currentStreak.addDate(currentDate);
			}

			return streaks;

		}, [])
	}

	private recache(): void {
		this.instances = this.instances.sort((a: Task, b: Task) => a.doneDate.diff(b.doneDate));
		this.streaks = [];
		this.rrule = new RRule(
			Object.assign(
				RRule.parseText(this.instances.first().recurrence.toText()),
				{ dtstart: this.instances.first().doneDate.toDate() }
			)
		);

	}
}
