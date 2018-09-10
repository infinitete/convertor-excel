import * as XLSX from 'xlsx';

const loadExcel = (file: File | null): Promise<any> => {

    if (file == null) {
        return new Promise((res, reject) => {
            return reject("文件不能为空");
        });
    }

    return new Promise((resolve, reject) => {

        const fileReader = new FileReader();

        fileReader.onloadend = (e: any) => {
            const worker = arrayBuffer2Excel(e.target.result);
            return resolve(worker);
        }

        fileReader.onerror = reject;
        fileReader.readAsArrayBuffer(file);
    });
}

const arrayBuffer2Excel = (buffer: ArrayBuffer) => {
    const worker = XLSX.read(buffer, { type: 'buffer'});
    return worker;
}

export { loadExcel };