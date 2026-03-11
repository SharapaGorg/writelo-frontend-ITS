export const useScrollButton = () => {
    const isScrollDownButtonVisible = ref(false);
    let observer: MutationObserver | null = null;

    const updateVisibility = () => {
        const container = document.querySelector('.messages-container') as HTMLElement;
        if (!container) return;

        isScrollDownButtonVisible.value =
            (container.clientHeight + container.scrollTop + 100) <= container.scrollHeight;
    };

    const scrollDownContainer = () => {
        const container = document.querySelector('.messages-container') as HTMLElement;
        if (!container) return;

        container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
        })
    }

    onMounted(() => {
        // Initial setup
        updateVisibility();

        // Watch for DOM changes
        observer = new MutationObserver(updateVisibility);
        const container = document.querySelector('.messages-container');
        if (container) {
            observer.observe(container, {
                attributes: true,
                childList: true,
                subtree: true
            });
            container.addEventListener('scroll', updateVisibility);
        }
    });

    onUnmounted(() => {
        observer?.disconnect();
        document.querySelector('.messages-container')
            ?.removeEventListener('scroll', updateVisibility);
    });

    return {
        isScrollDownButtonVisible,
        scrollDownContainer
    };
};
