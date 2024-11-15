function sortArray(arr) {
    const target = "Dumbways is awesome";
    
    const targetArr = target.split('');
    
    for (let i = 0; i < arr.length; i++) {
        let minIndex = i;
        
        for (let j = i + 1; j < arr.length; j++) {
            if (arr[j] === targetArr[i]) {
                minIndex = j;
                break;
            }
        }
        
        if (minIndex !== i) {
            let temp = arr[i];
            arr[i] = arr[minIndex];
            arr[minIndex] = temp;
        }
    }
    
    return arr.join('');
}

const inputArray = ["u", "D", "m", "w", "b", "a", "y", "s", "i", "s", "w", "a", "e", "s", "e", "o", "m"," "," "];
console.log("Input Array:", inputArray.join(''));
const result = sortArray(inputArray);
console.log("\nHasil Akhir:", result);
