export class UiTranslationRegistryService {
    constructor() {
        this.registry = [];
    }
    register(entry) {
        this.registry.push(entry);
    }
    getTranslator(uiSystemId) {
        return this.registry.find(r => r.id === uiSystemId)?.translator || null;
    }
}
