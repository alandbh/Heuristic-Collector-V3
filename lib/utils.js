import { useState, useEffect, useRef, useCallback } from "react";
import { MUTATION_PUBLIC, MUTATION_PUBLIC_SCORE_OBJ } from "./mutations";

export function debounce(func, wait = 1000, immediate) {
    var timeout;
    return function () {
        var context = this,
            args = arguments;
        var later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

// Returns a function, that, as long as it continues to be invoked, will only
// trigger every N milliseconds. If <code>immediate</code> is passed, trigger the
// function on the leading edge, instead of the trailing.

export function throttle(func, wait, immediate) {
    var timeout;
    return function () {
        var context = this,
            args = arguments;
        var later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        if (!timeout) timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

export function getUniqueItem(arr, key) {
    let arrayOfItems = [];
    let unique = arr.filter((element) => {
        const isDuplicate = arrayOfItems.includes(element[key]);

        if (!isDuplicate) {
            arrayOfItems.push(element[key]);

            return true;
        }

        return false;
    });

    return unique;
}

/**
 *
 * Debounced function for processing changes on Range
 */

export class Deferred {
    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.reject = reject;
            this.resolve = resolve;
        });
    }
}

const deferredPromise = {
    run: new Deferred(),
};

export async function waitForNewData() {
    deferredPromise.run = new Deferred();

    function standByDataT() {
        return deferredPromise.run.promise;
    }

    let dataNew = await standByDataT();

    return dataNew;
}

export function standByData() {
    return new Promise((resolve, reject) => {
        const intervalGetItd = setInterval(() => {
            if (initialScore.id) {
                resolve(initialScore);

                stopListening();
            }
        }, 1000);

        function stopListening() {
            clearInterval(intervalGetItd);
            initialScore.isNew = false;
        }
    });
}

export const processChange = debounce(
    async (client, variables, gqlString, isCreate = false) => {
        console.log("Saving data func", variables);

        doMutate(client, variables, gqlString, isCreate);
    },
    1000,
    false
);

export const processChangeEvidence = debounce(
    async (client, variables, gqlString, isCreate = false) => {
        console.log("Saving EVIDENCE func");

        doMutate(client, variables, gqlString, isCreate);
    },
    300,
    false
);

export async function doMutate(client, variables, gqlString, isCreate) {
    const { data } = await client.mutate({
        mutation: gqlString,
        variables,
    });

    if (data) {
        // console.log("doMutate", data);
        // DELETAR
        // const newId = isCreate ? data.createScore.id : data.updateScore.id;
        const newId = data.updatePlayer.id;
        doPublic(client, newId, isCreate);
    }
}

export async function doPublic(client, newId, isCreate) {
    // console.log("varr", newId);

    const { data } = await client.mutate({
        mutation: MUTATION_PUBLIC_SCORE_OBJ,
        variables: { playerId: newId },
    });

    // console.log("resopp", data);

    // initialScore.id = await data.publishScore.id;
    // initialScore.scoreValue = await data.publishScore.scoreValue;
    // initialScore.note = await data.publishScore.note;
    // initialScore.heuristic = await data.publishScore.heuristic;
    // initialScore.now = Date.now();

    if (!isCreate) {
        deferredPromise.run.resolve(data.publishPlayer);
    }

    // return _data;
}

export const initialScore = {};

/**
 *
 * useIsSticky hook
 */

export function useIsSticky(offset) {
    const [isSticky, setIsSticky] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const updatePosition = () => {
                if (window.pageYOffset > offset) {
                    setIsSticky(true);
                } else {
                    setIsSticky(false);
                }
            };

            window.addEventListener("scroll", updatePosition);

            return () => window.removeEventListener("scroll", updatePosition);
        }
    }, []);

    return isSticky;
}

export function getAllScoresApi(apiResult) {
    const scoresArr = [];

    apiResult.map((player) => {
        return Object.keys(player.scores).map((journey) => {
            // return player.scores[journey]
            let journeyScoresObj = player.scores[journey];

            // console.log("journeyScoresObj", journeyScoresObj);

            // return journeyScoresObj

            // let scoresArr = []

            if (
                journeyScoresObj.ignore_journey ||
                journeyScoresObj.zeroed_journey
            ) {
                return;
            }

            Object.keys(journeyScoresObj).map((heuristicNumber) => {
                if (
                    heuristicNumber === "ignore_journey" ||
                    heuristicNumber === "zeroed_journey"
                ) {
                    return;
                }
                let scoreObj = journeyScoresObj[heuristicNumber];
                scoreObj.playerName = player.name;
                scoreObj.playerSlug = player.slug;
                scoreObj.journeySlug = journey;
                scoreObj.heuristicNumber = heuristicNumber;

                scoresArr.push(scoreObj);

                // return scoreObj
            });

            return scoresArr;
        });
    });

    return scoresArr;
}

export function getAllFindingsApi(apiResult) {
    const findingsArr = [];

    apiResult.map((player) => {
        return Object.keys(player.findings).map((journey) => {
            // return player.scores[journey]
            // let journeyFindingsObj = player.findings[journey];
            let journeyFindingsArr = [];
            for (const finding in player.findings[journey]) {
                journeyFindingsArr.push(player.findings[journey][finding]);
            }
            let journeyFindingsObj = {};
            journeyFindingsObj.findings = journeyFindingsArr;
            journeyFindingsObj.playerSlug = player.slug;
            journeyFindingsObj.playerName = player.name;
            journeyFindingsObj.journeySlug = journey;

            findingsArr.push(journeyFindingsObj);

            // return journeyFindingsObj

            // let findingsArr = []

            // Object.keys(journeyFindingsObj).map((heuristicNumber) => {
            //     let scoreObj = journeyFindingsObj[heuristicNumber];
            //     scoreObj.playerName = player.name;
            //     scoreObj.playerSlug = player.slug;
            //     scoreObj.journeySlug = journey;
            //     scoreObj.heuristicNumber = heuristicNumber;

            //     // findingsArr.push(scoreObj);

            //     // return scoreObj
            // });

            return findingsArr;
        });
    });

    return findingsArr;
}

let saveTimeout = null;

export function delay(func, wait = 2000) {
    if (saveTimeout !== null) {
        clearTimeout(saveTimeout);
    }
    saveTimeout = window.setTimeout(() => {
        func();
    }, wait);
}

export const delayv2 = (ms) =>
    new Promise((resolve) => setTimeout(resolve, ms));

export function getUserLevel(userType) {
    if (userType === "admin") {
        return 1;
    } else if (userType === "tester") {
        return 2;
    } else if (userType === "regular") {
        return 3;
    } else if (userType === "reviewer") {
        return 4;
    } else {
        return 99;
    }
}

// Checks if the user is allowed

export function isUserAuthorized(user) {
    if (
        user?.email.includes("alandbh@gmail.com") ||
        user?.email.includes("luisanavarro.nc@gmail.com") ||
        user?.email.includes("marcogrossk@gmail.com") ||
        user?.email.includes("leosarma@gmail.com") ||
        user?.email.includes("sofiagreve@gmail.com") ||
        user?.email.includes("alanfuncionario@gmail.com") ||
        user?.email.includes("cindy.gcp.rga") ||
        user?.email.includes("@rga.com")
    ) {
        return true;
    }
}

export function sortCollection(collection, property, asc = true) {
    const ordered = [...collection].sort((a, b) => {
        if (a[property] < b[property]) {
            return asc ? -1 : 1;
        }
        if (a[property] > b[property]) {
            return asc ? 1 : -1;
        }

        return 0;
    });

    return ordered;
}

export function createPath(pathParams) {
    const {
        w,
        h,
        tlr,
        trr,
        brr,
        blr,
        x = 0,
        maxHeight = 512,
        vOffset = 0,
    } = pathParams;
    const y = maxHeight - (h - vOffset);
    return `
        M ${x} ${tlr + y} 
        A ${tlr} ${tlr} 0 0 1 ${tlr + x} ${y} 
        L ${w - trr + x} ${y} 
        A ${trr} ${trr} 0 0 1 ${w + x} ${trr + y} 
        L ${w + x} ${h + y - brr}
        A ${brr} ${brr} 0 0 1 ${w - brr + x} ${h + y} 
        L ${blr + x} ${h + y} 
        A ${blr} ${blr} 0 0 1 ${x} ${h + y - blr} 
        Z`;
}

export function getAverage(collection = []) {
    const sum = collection.reduce((acc, current) => {
        return acc + current.value;
    }, 0);

    return sum / collection.length;
}

export const timestampToDateString = (timestamp) => {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // +1 porque os meses em JavaScript vão de 0 a 11
    const year = date.getFullYear();
    return `${year}${month}${day}`;
};

export function getPreviousDate(dateString) {
    // Extrai o ano, mês e dia da string
    const year = parseInt(dateString.substring(0, 4), 10);
    const month = parseInt(dateString.substring(4, 6), 10) - 1; // Mês começa em 0 no objeto Date
    const day = parseInt(dateString.substring(6, 8), 10);

    // Cria o objeto Date
    const date = new Date(year, month, day);

    // Subtrai um dia
    date.setDate(date.getDate() - 1);

    // Formata de volta para yyyymmdd
    const previousYear = date.getFullYear();
    const previousMonth = String(date.getMonth() + 1).padStart(2, "0"); // Adiciona 1 porque o mês começa em 0
    const previousDay = String(date.getDate()).padStart(2, "0");

    return String(`${previousYear}${previousMonth}${previousDay}`);
}

export function dateStringToUTCDate(dateString, isFull = true) {
    // Extrai o ano, mês e dia da string
    const year = parseInt(dateString.substring(0, 4), 10);
    const month = parseInt(dateString.substring(4, 6), 10) - 1; // Mês começa em 0 no objeto Date
    const day = parseInt(dateString.substring(6, 8), 10);

    // Cria o objeto Date
    const date = new Date(year, month, day);

    return isFull
        ? String(
              date.toLocaleString("en-US", {
                  dateStyle: "medium",
                  //   timeStyle: "short",
              })
          )
        : `${String(day).padStart(2, "0")}/${String(month + 1).padStart(
              2,
              "0"
          )}`;
}

export function calculateDateDifferenceInDays(date1, date2) {
    // Convert the dates to Date objects
    const year1 = parseInt(date1.slice(0, 4), 10);
    const month1 = parseInt(date1.slice(4, 6), 10) - 1; // Months start from 0
    const day1 = parseInt(date1.slice(6, 8), 10);

    const year2 = parseInt(date2.slice(0, 4), 10);
    const month2 = parseInt(date2.slice(4, 6), 10) - 1;
    const day2 = parseInt(date2.slice(6, 8), 10);

    const dateObj1 = new Date(year1, month1, day1);
    const dateObj2 = new Date(year2, month2, day2);

    // Calculate the difference in milliseconds
    const differenceMs = Math.abs(dateObj1 - dateObj2);

    // Convert milliseconds to days
    const differenceDays = differenceMs / (1000 * 60 * 60 * 24);

    return differenceDays;
}

export function calculateBusinessDays(startDate, endDate) {
    // Convert the dates to Date objects
    const startYear = parseInt(startDate.slice(0, 4), 10);
    const startMonth = parseInt(startDate.slice(4, 6), 10) - 1; // Months start from 0
    const startDay = parseInt(startDate.slice(6, 8), 10);

    const endYear = parseInt(endDate.slice(0, 4), 10);
    const endMonth = parseInt(endDate.slice(4, 6), 10) - 1;
    const endDay = parseInt(endDate.slice(6, 8), 10);

    let startDateObj = new Date(startYear, startMonth, startDay);
    let endDateObj = new Date(endYear, endMonth, endDay);

    // Ensure the start date is before the end date
    if (startDateObj > endDateObj) {
        [startDateObj, endDateObj] = [endDateObj, startDateObj];
    }

    let businessDaysCount = 0;

    // Loop through the dates and count business days
    for (
        let currentDate = new Date(startDateObj);
        currentDate <= endDateObj;
        currentDate.setDate(currentDate.getDate() + 1)
    ) {
        const dayOfWeek = currentDate.getDay();
        // Count only weekdays (Monday to Friday)
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            businessDaysCount++;
        }
    }

    return businessDaysCount;
}
