import {getPages} from "../lib/utils.js";

export const initPagination = ({pages, fromRow, toRow, totalRows}, createPage) => {
    // подготовить шаблон кнопки для страницы и очистить контейнер
    const pageTemplate = pages.firstElementChild.cloneNode(true);
    pages.firstElementChild.remove();

    let pageCount;
    let currentLimit;
    let lastQueryStr;

    const applyPagination = (query, state, action) => {
        const limit = state.rowsPerPage;
        let page = state.page;

        const currentQueryStr = JSON.stringify(query);

        if (
            (currentLimit && currentLimit !== limit) || 
            (lastQueryStr !== undefined && lastQueryStr !== currentQueryStr)
        ) {
            page = 1;
        }

        currentLimit = limit;
        lastQueryStr = currentQueryStr;

        // обработать действия
        if (action) switch(action.name) {
            case 'prev': page = Math.max(1, page - 1); break;
            case 'next': page = Math.min(pageCount || 1, page + 1); break;
            case 'first': page = 1; break;
            case 'last': page = pageCount || 1; break;
        }

        return Object.assign({}, query, {
            limit,
            page
        });
    }

    const updatePagination = (total, { page, limit }) => {
        pageCount = Math.ceil(total / limit) || 1;

        // получить список видимых страниц и вывести их
        const visualPage = Math.max(1, Math.min(page, pageCount));
        const visiblePages = getPages(visualPage, pageCount, 5);
        pages.replaceChildren(...visiblePages.map(pageNumber => {
            const el = pageTemplate.cloneNode(true);
            return createPage(el, pageNumber, pageNumber === visualPage);
        }));

        // обновить статус пагинации
        fromRow.textContent = total === 0 ? 0 : (visualPage - 1) * limit + 1;
        toRow.textContent = Math.min((visualPage * limit), total);
        totalRows.textContent = total;
    }

    return {
        updatePagination,
        applyPagination
    };
}