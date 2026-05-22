document.addEventListener("DOMContentLoaded", () => {

    function applyTextWrap() {

        // Sélectionner tous les éléments
        const elements = document.querySelectorAll("*");

        elements.forEach(element => {

            // Ignorer les éléments dans une zone exclue
            if (element.closest(".no-global-wrap")) {
                return;
            }

            // Ignorer certains éléments
            const ignoredTags = [
                "SCRIPT",
                "STYLE",
                "INPUT",
                "TEXTAREA",
                "IMG",
                "SVG",
                "PATH",
                "BUTTON"
            ];

            if (ignoredTags.includes(element.tagName)) {
                return;
            }

            // Vérifier si l'élément contient du texte
            const hasText = element.textContent.trim().length > 0;

            if (hasText) {

                // Appliquer le wrapping
                element.style.overflowWrap = "break-word";
                element.style.wordWrap = "break-word";
                element.style.wordBreak = "break-word";
                element.style.whiteSpace = "normal";
            }
        });
    }

    applyTextWrap();

    // Observer les nouveaux éléments ajoutés dynamiquement
    const observer = new MutationObserver(() => {
        applyTextWrap();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

});