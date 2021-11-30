import { CorePlugin } from "./core.plugin";

export class PluginHost {
    plugins: CorePlugin.Base[] = [];

    register<T extends CorePlugin.Base>(plugin: T) {
        this.plugins.add(plugin);
    }

    remove<T extends CorePlugin.Base>(plugin: T) {
        this.plugins.remove(plugin);
    }

    each<T extends CorePlugin.Base>(func: (plugin: T) => void) {
        this.plugins.forEach(func);
    }

    map<T extends CorePlugin.Base, R = never>(func: (plugin: T) => R): R[] {
        return this.plugins.map(func)!;
    }

    filter<T extends CorePlugin.Base, R>(func: (plugin: T) => R): T[] {
        return this.plugins.filter<T>(((p) => func(p)) as any);
    }

    find<T extends CorePlugin.Base, R>(func: (plugin: T) => R): T | undefined {
        return this.plugins.find<T>(((p) => func(p)) as any);
    }
}
