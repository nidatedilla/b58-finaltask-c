function sortArray(arr) {
    // Target string yang ingin dicapai
    const target = "Dumbways is awesome";
    
    // Konversi target string menjadi array karakter
    const targetArr = target.split('');
    
    // Selection sort
    for (let i = 0; i < arr.length; i++) {
        let minIndex = i;
        
        // Mencari karakter yang sesuai dengan posisi target
        for (let j = i + 1; j < arr.length; j++) {
            if (arr[j] === targetArr[i]) {
                minIndex = j;
                break;
            }
        }
        
        // Swap karakter
        if (minIndex !== i) {
            let temp = arr[i];
            arr[i] = arr[minIndex];
            arr[minIndex] = temp;
        }
        
        // Tampilkan proses sorting
        console.log(`Step ${i + 1}:`, arr.join(''));
    }
    
    return arr.join('');
}

// Test fungsi
const inputArray = ["u", "D", "m", "w", "b", "a", "y", "s", "i", "s", "w", "a", "e", "s", "e", "o", "m"," "," "];
console.log("Input Array:", inputArray.join(''));
console.log("\nProses Sorting:");
const result = sortArray(inputArray);
console.log("\nHasil Akhir:", result);
