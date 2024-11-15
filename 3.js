function cetakPola(n) {
    const maxWidth = 2 * n - 1;
    
    for (let i = 0; i < n; i++) {
        let baris = '';
        
        const spasiAwal = ' '.repeat(i * 2);
        const lebarPola = (n - i) * 2 - 1;
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

console.log("cetakPola(5)");
cetakPola(5);
