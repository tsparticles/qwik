import { CSSProperties, component$, useSignal, useTask$ } from "@builder.io/qwik";
import { type Container, type Engine, type ISourceOptions, tsParticles } from "tsparticles-engine";
import { isServer } from "@builder.io/qwik/build";

interface IParticlesProps {
    id?: string;
    width?: string;
    height?: string;
    options?: ISourceOptions;
    url?: string;
    style?: CSSProperties;
    className?: string;
    canvasClassName?: string;
    container?: { current: Container };
    init?: (engine: Engine) => Promise<void>;
    loaded?: (container: Container) => Promise<void>;
}

export const Particles = component$<IParticlesProps>((props) => {
    console.log(isServer);

    //if (isServer) {
    //    return <></>;
    //}

    const initialized = useSignal(false),
        containerId = useSignal<string>(),
        { className, canvasClassName, id, init, loaded, options, url, width, height } = props;

    useTask$(async ({ track }) => {
        track(() => initialized.value);

        if (!init || !initialized.value) {
            return;
        }

        await init(tsParticles);

        initialized.value = true;
    });

    useTask$(async ({ track }) => {
        track(() => initialized.value);

        if (!initialized.value) {
            return;
        }

        let container = tsParticles.dom().find(t => t.id === containerId.value);

        container?.destroy();

        container = await tsParticles.load({ id, url, options });

        containerId.value = container?.id;

        if (loaded && container) {
            await loaded(container);
        }
    });

    return (
        <div class={className ?? ""} id={id}>
            <canvas
                class={canvasClassName ?? ""}
                style={{
                    ...props.style,
                    width,
                    height,
                }}
            />
        </div>
    );
});
