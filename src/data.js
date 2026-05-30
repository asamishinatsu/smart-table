import {makeIndex} from "./lib/utils.js";

export function initData(sourceData) {
    const BASE_URL = 'https://webinars.webdev.education-services.ru/sp7-api';

    // переменные для кеширования данных
    let sellers;
    let customers;
    let lastResult;
    let lastQuery;

    // функция для приведения строк в тот вид, который нужен нашей таблице
    const mapRecords = (data) => data.map(item => ({
        id: item.receipt_id,
        date: item.date,
        seller: sellers[item.seller_id],
        customer: customers[item.customer_id],
        total: item.total_amount
    }));

    // функция получения индексов
    const getIndexes = async () => {
        if (!sellers || !customers) { // если индексы ещё не установлены, то делаем запросы
            [sellers, customers] = await Promise.all([
                fetch(`${BASE_URL}/sellers`).then(res => res.json()), // запрашиваем продавцов
                fetch(`${BASE_URL}/customers`).then(res => res.json()), // запрашиваем покупателей
            ]);
        }

        return { sellers, customers };
    }

    // функция получения записей о продажах с сервера
    const getRecords = async (query, isUpdated = false) => {
        const qs = new URLSearchParams(query);
        const nextQuery = qs.toString();

        if (lastQuery === nextQuery && !isUpdated) {
            return lastResult;
        }

        // если прошлый квери не был ранее установлен или поменялись параметры, то запрашиваем данные с сервера
        const response = await fetch(`${BASE_URL}/records?${nextQuery}`);
        const records = await response.json();

        lastQuery = nextQuery; // сохраняем для следующих запросов
        lastResult = {
            total: records.total,
            items: mapRecords(records.items)
        };

        return lastResult;
    };

    return {
        getIndexes,
        getRecords
    };
}