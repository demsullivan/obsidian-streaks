import { App, Modal, Events as ObsidianEvents, EventRef, Plugin, PluginSettingTab, Setting } from 'obsidian';
import Cache from "./Cache";
import Events from "./Events";
import StreaksBlockRenderer from "./StreaksBlockRenderer";
// Remember to rename these classes and interfaces!



export interface StreaksSettings {
	taskTag: string;
}

const DEFAULT_SETTINGS: StreaksSettings = {
	taskTag: '#Habits'
}

export default class StreaksPlugin extends Plugin {
	private settings: StreaksSettings;
	private cache:    Cache;
	private renderer: StreaksBlockRenderer;

	async onload() {
		await this.loadSettings();

		const events = new Events({ obsidianEvents: this.app.workspace });

		this.cache = new Cache({
			events,
			settings: this.settings
		});

		this.renderer = new StreaksBlockRenderer({ plugin: this, events });
	}

	async onunload() {
		this.cache.unload();
		await this.saveSettings();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

// class SampleSettingTab extends PluginSettingTab {
// 	plugin: MyPlugin;
//
// 	constructor(app: App, plugin: MyPlugin) {
// 		super(app, plugin);
// 		this.plugin = plugin;
// 	}
//
// 	display(): void {
// 		const {containerEl} = this;
//
// 		containerEl.empty();
//
// 		containerEl.createEl('h2', {text: 'Settings for my awesome plugin.'});
//
// 		new Setting(containerEl)
// 			.setName('Setting #1')
// 			.setDesc('It\'s a secret')
// 			.addText(text => text
// 				.setPlaceholder('Enter your secret')
// 				.setValue(this.plugin.settings.mySetting)
// 				.onChange(async (value) => {
// 					console.log('Secret: ' + value);
// 					this.plugin.settings.mySetting = value;
// 					await this.plugin.saveSettings();
// 				}));
// 	}
// }
