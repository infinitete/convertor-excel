import * as XLSX from 'xlsx';

interface IColumn {
    dataIndex: string,
    title: any,
    key: any
};

/**
 *
 * @param file
 *
 * @return Promise
 */
const loadExcel = (file: File | null): Promise<any> => {

    if (file == null) {
        return new Promise((res, reject) => {
            return reject("文件不能为空");
        });
    }

    return new Promise((resolve, reject) => {

        const fileReader = new FileReader();

        fileReader.onloadend = (e: any) => {
            const data = arrayBuffer2Excel(e.target.result);

            const keys   = withColumns(data);
            return resolve(keys);
        }

        fileReader.onerror = reject;
        fileReader.readAsArrayBuffer(file);
    });
}

/**
 *
 * @param buffer
 */
const arrayBuffer2Excel = (buffer: ArrayBuffer) => {
    const worker = XLSX.read(buffer, { type: 'buffer'});
    const data = new Object;
    worker.SheetNames.forEach(v => {
        data[v] = XLSX.utils.sheet_to_json(worker.Sheets[v]);
    });

    return data;
}

/**
 *
 * @param data
 *
 * @returns { columns, dataSource }
 */
const withColumns = (data: object) => {

    const columns: object[] = [];

    for (const key in data) {
        if (data.hasOwnProperty(key)) {

            columns[key] = [];

            const element = data[key][0];
            for (const k1 in element) {
                if (element.hasOwnProperty(k1)) {
                    const v = element[k1];

                    const def: IColumn = {
                        dataIndex: '',
                        key: null,
                        title: null
                    };

                    def.dataIndex = k1;
                    def.title = v;
                    def.key = k1;


                    columns[key].push(def);
                }
            }

            data[key] = data[key].slice(1);
        }
    };

    return {
        columns,
        dataSource: data
    }
}


export { loadExcel };