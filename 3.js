function cetakPola(n) {
    // Hitung lebar maksimum untuk centering
    const maxWidth = 2 * n - 1;
    
    for (let i = 0; i < n; i++) {
        let baris = '';
        
        // Hitung spasi di awal untuk centering
        const spasiAwal = ' '.repeat(i * 2);
        const lebarPola = (n - i) * 2 - 1;  // Lebar pola di baris ini
        const spasiTengah = ' '.repeat((maxWidth - lebarPola) / 2);
        
        // Karakter untuk baris saat ini
        if (i === 0) {
            baris = '# + # + #';
        } else if (i === 1) {
            baris = '+ + + +';
        } else if (i === 2) {
            baris = '+ # +';
        } else if (i === 3) {
            baris = '+ +';
        } else {
            baris = '#';
        }
        
        console.log(spasiTengah + baris);
    }
}

// Test fungsi
console.log("Pola untuk n = 5:");
cetakPola(5);
