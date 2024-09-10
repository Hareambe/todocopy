import { format } from 'date-fns';
export interface DropdownModel {
    name: string;
    code: string;
}
export interface Customers {
    no: number;
    name: string;
}
export interface SvgProps {
    width: number;
    height: number;
}
export interface CustomerDispatchAdress {
    custNo: string;
    custType: string;
    custName: string;
    addressType: string;
    addressCode: string;
    lineNo: string;
    address1: string;
    address2: string;
    address3: string;
    countryCode: string;
    country: string;
}

export interface Plants {
    plantCode: string;
    plantName: string;
}
export interface CostumResponse {
    message: string;
    notes: string;
    success: boolean;
}
export interface Companies {
    nameShort: string;
}

export const emptyDropdown: DropdownModel = {
    name: '',
    code: ''
};
export const defaultDate = new Date('2000-01-01');
export const today = new Date();
export let todayDate = format(today, 'yyyyMMdd');
export let todayHour = format(today, 'HHmmss');

export function formatDateGeneric(inputDate: Date | null | undefined) {
    // Tarih nesnesine dönüştürme
    if (!inputDate) {
        return ''; // veya uygun bir hata mesajı döndürebilirsiniz
    }
    var dateObject = new Date(inputDate);

    // Yıl, ay ve günü alın
    var year = dateObject.getFullYear();
    var month = ('0' + (dateObject.getMonth() + 1)).slice(-2); // Ay 0'dan başlar, bu yüzden +1 eklenir ve iki haneli olacak şekilde biçimlendirilir
    var day = ('0' + dateObject.getDate()).slice(-2); // Günü iki haneli olacak şekilde biçimlendir

    // Biçimlendirilmiş tarih oluşturma (YYYY-MM-DD formatında)
    var formattedDate = year + '-' + month + '-' + day;

    return formattedDate;
}

export function FormattingDateTime(value: Date) {
    //debugger;
    const dateValue = new Date(value);
    const checkDate = new Date('2000-01-01');
    const checkDateTime = new Date('2000-01-01T00:00:00');
    if (dateValue.getTime() === checkDateTime.getTime() || dateValue.getTime() == checkDate.getTime()) {
        return null;
    } else {
        return format(new Date(dateValue), 'dd/MM/yyyy-HH:mm');
    }
}

export function FormattingDate(value: Date) {
    const dateValue = new Date(value);
    const checkDate = new Date('2000-01-01');
    const checkDateTime = new Date('2000-01-01T00:00:00');

    if (dateValue.getTime() == checkDate.getTime() || dateValue.getTime() == checkDateTime.getTime()) {
        return null;
    } else {
        return format(new Date(dateValue), 'dd/MM/yyyy');
    }
}

export function FormatTimeZoneDateTime(value: Date) {
    const dateValue = new Date(value);
    const timezone = new Date().getTimezoneOffset().valueOf();
    let timezoneOffset = 0;
    if (timezone < 0) {
        timezoneOffset = Math.abs(timezone);
    }
    // UTC+03:00 formatına dönüştürmek için tarih ve saat değerlerini güncelle
    dateValue.setMinutes(dateValue.getMinutes() + timezoneOffset);

    return dateValue;
}
