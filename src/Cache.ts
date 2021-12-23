import { EventRef } from 'obsidian';
import _ from 'lodash';

import type { Cache as State } from 'obsidian-tasks/src/Cache';
import { Task, Status as TaskStatus } from "obsidian-tasks/src/Task";

import RecurringTask from './RecurringTask';
import Streak from './Streak';
import Events from './Events';

import type { StreaksSettings } from './main';

interface GroupedTasks {
	[description: string] : Task[]
}

export interface GroupedStreaks {
	[description: string]: Streak[]
}

export default class Cache {
	private readonly events: Events;
	private readonly tasksEventReferences: EventRef[];
	private readonly streaksEventReferences: EventRef[];
	private readonly settings: StreaksSettings;

	private recurringTasks: RecurringTask[];

	constructor({ events, settings }: { events: Events, settings: StreaksSettings }) {
		this.events               = events;
		this.tasksEventReferences = [];
		this.recurringTasks       = [];
		this.settings             = settings;

		this.subscribeToTasks();
		this.subscribeToStreaks();
	}

	public unload(): void {
		for (const eventRef of this.tasksEventReferences) {
			this.events.offref(eventRef);
		}

		for (const eventRef of this.streaksEventReferences) {
			this.events.offref(eventRef);
		}
	}

	private subscribeToTasks(): void {
		const cacheUpdateEventRef = this.events.onTasksCacheUpdate(
			this.handleTasksCacheUpdate.bind(this)
		);

		this.tasksEventReferences.push(cacheUpdateEventRef);
	};

	private subscribeToStreaks(): void {
		const streaksRequestUpdateEventRef = this.events.onRequestCacheUpdate(handler => {
			handler({ tasks: this.recurringTasks });
		});

		this.streaksEventReferences.push(streaksRequestUpdateEventRef);
	}

	private handleTasksCacheUpdate({ tasks, state }: { tasks: Task[], state: State }) {
		console.log('handle task cache update');
		this.recurringTasks = _.map(
			this.groupedTasks(tasks),
			(tasks: Task[], description: string) => new RecurringTask(description, tasks)
		);

		this.events.triggerCacheUpdate({ tasks: this.recurringTasks });
	}

	private groupedTasks(tasks: Task[]): GroupedTasks {
		const filteredTasks = tasks.filter((t: Task) => {
			return t.description.includes(this.settings.taskTag) &&
				t.status == TaskStatus.Done;
		});

		return _.groupBy(filteredTasks, (t: Task) => t.description);
	}
}
