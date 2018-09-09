let loading: boolean = false;
let arrayBuffer: ArrayBuffer;

const onFileLoaded = (e: any) => {
    loading = false;

    try {
       arrayBuffer = e.target.result;
    } catch (error) {
       arrayBuffer = new ArrayBuffer(0);
    }
}

const loadExcel = (file: File): any => {
    const reader = new FileReader();
    reader.onload = onFileLoaded;

    loading = true;
    reader.readAsArrayBuffer(file);
}


// class Loader() {
//     public constructor: boolean () {
//         return true;
//     }
// }