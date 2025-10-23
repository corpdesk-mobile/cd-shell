export class UiSystemAdaptorService {
    constructor(translator) {
        this.translator = translator;
    }
    render(descriptor) {
        switch (descriptor.type) {
            case 'layout':
            // return this.translator.translateLayout(descriptor as UiLayoutDescriptor);
            case 'component':
            // return this.translator.translateComponent(descriptor as UiComponentDescriptor);
            default:
                throw new Error(`Unsupported descriptor type: ${descriptor.type}`);
        }
    }
}
