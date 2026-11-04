// Remove the version number of the deliverables items in the table of contents.
(function() {
    /*
    const regex = /111\.1\.\d\./g;

    document
        .querySelectorAll('ol > li > ol > li > ol > li > a > strong')
        .forEach(item => item.innerText = item.innerText.replace(regex, ''));
    */
})();

(function() {
    const path = window.location.pathname || '';
    if (path.endsWith('/print.html') || path.endsWith('print.html')) {
        document.documentElement.classList.add('print-view');
    }
})();

(function() {
    function buildFlatPrintToc(tocList, headings, startIndex) {
        headings.slice(startIndex).forEach((heading) => {
            const title = (heading.textContent || '').trim();
            if (!title) {
                return;
            }

            const item = document.createElement('li');
            const link = document.createElement('a');
            link.href = `#${heading.id}`;
            link.textContent = title;
            item.appendChild(link);
            tocList.appendChild(item);
        });
    }

    function buildPrintToc() {
        const tocList = document.querySelector('.print-toc__list');
        if (!tocList || tocList.dataset.built === 'true') {
            return tocList && tocList.dataset.built === 'true';
        }

        const headings = Array.from(document.querySelectorAll('main h1[id]'));
        if (!headings.length) {
            return false;
        }

        const tocSource = document.querySelector('#mdbook-sidebar mdbook-sidebar-scrollbox .chapter')
            || document.querySelector('#mdbook-sidebar .chapter')
            || document.querySelector('mdbook-sidebar-scrollbox .chapter');

        if (!tocSource) {
            return false;
        }

        const tocClone = tocSource.cloneNode(true);
        tocClone.querySelectorAll('.chapter-fold-toggle').forEach((toggle) => toggle.remove());
        tocClone.querySelectorAll('.active').forEach((el) => el.classList.remove('active'));
        tocClone.querySelectorAll('.expanded').forEach((el) => el.classList.remove('expanded'));

        const tocLinks = Array.from(tocClone.querySelectorAll('a[href]'));
        if (tocLinks.length !== headings.length) {
            const startIndex = headings[0].id === 'cover' ? 1 : 0;
            tocList.innerHTML = '';
            buildFlatPrintToc(tocList, headings, startIndex);
            tocList.dataset.built = 'true';
            return true;
        }

        tocLinks.forEach((link, index) => {
            const heading = headings[index];
            link.setAttribute('href', `#${heading.id}`);
        });

        if (headings[0].id === 'cover' && tocLinks[0]) {
            const coverItem = tocLinks[0].closest('li');
            if (coverItem) {
                coverItem.remove();
            }
        }

        tocList.innerHTML = '';
        while (tocClone.firstChild) {
            tocList.appendChild(tocClone.firstChild);
        }

        tocList.dataset.built = 'true';
        return true;
    }

    function measureCssValue(value) {
        if (!value) {
            return 0;
        }
        const probe = document.createElement('div');
        probe.style.position = 'absolute';
        probe.style.visibility = 'hidden';
        probe.style.height = value;
        document.body.appendChild(probe);
        const height = probe.getBoundingClientRect().height;
        probe.remove();
        return height;
    }

    function getPrintContentHeight() {
        const styles = getComputedStyle(document.documentElement);
        const defaultPageHeight = '297mm';
        const defaultMarginTop = '18mm';
        const defaultMarginBottom = '20mm';

        const pageHeightValue = styles.getPropertyValue('--print-page-height').trim() || defaultPageHeight;
        const marginTopValue = styles.getPropertyValue('--print-page-margin-top').trim() || defaultMarginTop;
        const marginBottomValue = styles.getPropertyValue('--print-page-margin-bottom').trim() || defaultMarginBottom;

        const pageHeight = measureCssValue(pageHeightValue);
        const marginTop = measureCssValue(marginTopValue);
        const marginBottom = measureCssValue(marginBottomValue);

        if (!pageHeight) {
            return 0;
        }

        return pageHeight - marginTop - marginBottom;
    }

    function computePrintPageMap() {
        const main = document.querySelector('main');
        if (!main) {
            return null;
        }

        const pageHeight = getPrintContentHeight();
        const fallbackHeight = window.innerHeight || 0;
        const effectivePageHeight = pageHeight || fallbackHeight;
        if (!effectivePageHeight) {
            return null;
        }

        const pageMap = new Map();
        const mainTop = main.getBoundingClientRect().top;

        Array.from(main.querySelectorAll('h1[id]')).forEach((heading) => {
            const rect = heading.getBoundingClientRect();
            const offset = rect.top - mainTop;
            const page = Math.floor(offset / effectivePageHeight) + 1;
            pageMap.set(heading.id, page);
        });

        return pageMap;
    }

    function applyPrintTocPageNumbers() {
        const tocList = document.querySelector('.print-toc__list');
        if (!tocList) {
            return false;
        }

        const pageMap = computePrintPageMap();
        if (!pageMap) {
            return false;
        }

        tocList.querySelectorAll('a[href^="#"]').forEach((link) => {
            const id = link.getAttribute('href').slice(1);
            const pageNumber = pageMap.get(id);
            if (pageNumber) {
                link.dataset.page = pageNumber;
            } else {
                delete link.dataset.page;
            }
        });

        return true;
    }

    function schedulePrintTocPageNumbers() {
        if (schedulePrintTocPageNumbers.started) {
            return;
        }
        schedulePrintTocPageNumbers.started = true;

        const run = () => {
            const apply = () => {
                applyPrintTocPageNumbers();
            };

            if (document.fonts && document.fonts.ready) {
                document.fonts.ready.then(() => {
                    requestAnimationFrame(apply);
                });
            } else {
                requestAnimationFrame(apply);
            }
        };

        window.addEventListener('beforeprint', run);

        if (window.matchMedia) {
            const media = window.matchMedia('print');
            if (media.matches) {
                run();
            }
            if (media.addEventListener) {
                media.addEventListener('change', (event) => {
                    if (event.matches) {
                        run();
                    }
                });
            } else if (media.addListener) {
                media.addListener((event) => {
                    if (event.matches) {
                        run();
                    }
                });
            }
        }

        window.addEventListener('load', () => {
            applyPrintTocPageNumbers();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            let attempts = 10;
            const retry = () => {
                if (!buildPrintToc() && attempts > 0) {
                    attempts -= 1;
                    setTimeout(retry, 50);
                    return;
                }
                schedulePrintTocPageNumbers();
                requestAnimationFrame(() => {
                    applyPrintTocPageNumbers();
                    setTimeout(applyPrintTocPageNumbers, 200);
                });
            };
            retry();
        });
    } else {
        buildPrintToc();
        schedulePrintTocPageNumbers();
        requestAnimationFrame(() => {
            applyPrintTocPageNumbers();
            setTimeout(applyPrintTocPageNumbers, 200);
        });
    }
})();
