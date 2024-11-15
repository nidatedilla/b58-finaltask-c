function hitungInvestasi() {
    const modalAwal = 1000000000;
    
    // Alokasi dana
    const depositoBank = 350000000;
    const obligasiNegara = 650000000 * 0.30; 
    const sahamA = 650000000 * 0.35;
    const sahamB = 650000000 * 0.35;
    
    // Return per tahun
    const returnDeposito = 0.035;
    const returnObligasi = 0.13;
    const returnSahamA = 0.145;
    const returnSahamB = 0.125;
    
    // Hitung total setelah 2 tahun
    const totalDeposito = depositoBank * Math.pow((1 + returnDeposito), 2);
    const totalObligasi = obligasiNegara * Math.pow((1 + returnObligasi), 2);
    const totalSahamA = sahamA * Math.pow((1 + returnSahamA), 2);
    const totalSahamB = sahamB * Math.pow((1 + returnSahamB), 2);
    
    // Total keseluruhan
    const totalInvestasi = totalDeposito + totalObligasi + totalSahamA + totalSahamB;
    
    console.log("=== Hasil Investasi Setelah 2 Tahun ===");
    console.log(`Modal Awal: Rp ${modalAwal.toLocaleString('id-ID')}`);
    console.log(`Total Uang: Rp ${totalInvestasi.toLocaleString('id-ID')}`);
    console.log(`Keuntungan: Rp ${(totalInvestasi - modalAwal).toLocaleString('id-ID')}`);
    
    return totalInvestasi;
}

hitungInvestasi();
