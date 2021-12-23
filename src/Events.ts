import type { EventRef, Events as ObsidianEvents } from 'obsidian';
import type RecurringTask from './RecurringTask';
import type { Task } from "obsidian-tasks/src/Task";
import type { Cache as TasksState } from 'obsidian-tasks/src/Cache';

enum TasksEvent {
	RequestCacheUpdate = 'obsidian-tasks-plugin:request-cache-update',
	CacheUpdate = 'obsidian-tasks-plugin:cache-update'
}

enum Event {
	RequestCacheUpdate = 'obsidian-streaks-plugin:request-cache-update',
	CacheUpdate = 'obsidian-streaks-plugin:cache-update'
}

export default class Events {
	private obsidianEvents: ObsidianEvents;

	constructor({ obsidianEvents }: { obsidianEvents: ObsidianEvents }) {
		this.obsidianEvents = obsidianEvents;
	}

	public onCacheUpdate(
		handler: (updatePayload: { tasks: RecurringTask[] }) => void
	): EventRef {
		return this.obsidianEvents.on(Event.CacheUpdate, handler);
	}

	public onRequestCacheUpdate(
		handler: (fn: (updatePayload: { tasks: RecurringTask[] }) => void) => void
	): EventRef {
		return this.obsidianEvents.on(Event.RequestCacheUpdate, handler);
	}

	public onTasksCacheUpdate(
		handler: ({ tasks, state }: { tasks: Task[], state: TasksState }) => void
	): EventRef {
		return this.obsidianEvents.on(TasksEvent.CacheUpdate, handler);
	}

	public triggerCacheUpdate(updatePayload: { tasks: RecurringTask[] }): void {
		this.obsidianEvents.trigger(Event.CacheUpdate, updatePayload);
	}

	public triggerRequestCacheUpdate(
		fn: (updatePayload: { tasks: RecurringTask[] }) => void
	): void {
		this.obsidianEvents.trigger(Event.RequestCacheUpdate, fn);
	}

	public offref(eventRef: EventRef): void {
		this.obsidianEvents.offref(eventRef);
	}
}
