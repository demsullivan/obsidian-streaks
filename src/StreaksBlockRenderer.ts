import {
	App,
	EventRef,
	MarkdownPostProcessorContext,
	MarkdownRenderChild,
	Plugin
} from "obsidian";

import type RecurringTask from './RecurringTask';
import Events from "./Events";

export default class StreaksBlockRenderer {
	private readonly app: App;
	private readonly events: Events;

	constructor({ plugin, events }: { plugin: Plugin, events: Events }) {
		this.app = plugin.app;
		this.events = events;

		console.log('init renderer');

		plugin.registerMarkdownCodeBlockProcessor(
			'streaks',
			this._addQueryRenderChild.bind(this)
		);
	}

	public addQueryRenderChild = this._addQueryRenderChild.bind(this);

	private async _addQueryRenderChild(
		source: string,
		element: HTMLElement,
		context: MarkdownPostProcessorContext
	) {
		context.addChild(
			new QueryRenderChild({
				app:       this.app,
				events:    this.events,
				container: element,
				source
			})
		);
	}
}

class QueryRenderChild extends MarkdownRenderChild {
	private readonly app: App;
	private readonly events: Events;
	private readonly source: string;

	private renderEventRef: EventRef | undefined;

	constructor({
		app,
		events,
		container,
		source
	}: {
		app: App;
		events: Events;
		container: HTMLElement;
		source: string
	}) {
		super(container);

		this.app = app;
		this.events = events;
		this.source = source;

		console.log('init render child');
	}

	onload() {
		console.log('init event listener');
		this.events.triggerRequestCacheUpdate(this.render.bind(this));
		this.renderEventRef = this.events.onCacheUpdate(this.render.bind(this));
	}

	onunload() {
		if (this.renderEventRef !== undefined) {
			this.events.offref(this.renderEventRef);
		}
	}

	private async render({ tasks }: { tasks: RecurringTask[] }) {
		const content = this.containerEl.createEl('div');

		console.log('render');

		content.appendChild(
			this.containerEl.createEl('h3', { text: "Latest Streaks" })
		);

		const table = this.containerEl.createEl('table');

		const headTr = this.containerEl.createEl('tr');
		headTr.appendChild(this.containerEl.createEl('th', { text: "Name" }));
		headTr.appendChild(this.containerEl.createEl('th', { text: "Streak" }));

		table.appendChild(headTr);

		tasks.forEach((task: RecurringTask) => {
			const tr = this.containerEl.createEl('tr');

			tr.appendChild(
				this.containerEl.createEl('td', { text: task.name })
			);

			tr.appendChild(
				this.containerEl.createEl('td', { text: task.getLatestStreak().length.toString() })
			);

			table.appendChild(tr);
		});

		content.appendChild(table);

		this.containerEl.firstChild?.replaceWith(content);
	}
}
