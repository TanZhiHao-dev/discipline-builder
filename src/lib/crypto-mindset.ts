// Crypto mindset & journey — distilled interviews.
//
// Own-words takeaways from crypto journey/mindset videos (personal study notes).
// Focus = transferable mindset, risk, discipline, and strategy — the human side
// of trading that fits the Discipline Builder theme. Grows one "story" at a time.

export type MindsetTopic =
  | "mindset"
  | "work-ethic"
  | "risk-decision"
  | "money-management"
  | "crypto-strategy"
  | "discipline"
  | "lesson-learned";

export const MINDSET_TOPIC_META: Record<MindsetTopic, { label: string; emoji: string }> = {
  mindset: { label: "Mindset", emoji: "🧭" },
  "work-ethic": { label: "Etos Kerja", emoji: "🔨" },
  "risk-decision": { label: "Keputusan Risiko", emoji: "🎲" },
  "money-management": { label: "Kelola Uang", emoji: "💵" },
  "crypto-strategy": { label: "Strategi Crypto", emoji: "📊" },
  discipline: { label: "Disiplin", emoji: "🧘" },
  "lesson-learned": { label: "Pelajaran", emoji: "🎓" },
};

export type MindsetTheme = {
  topic: MindsetTopic;
  title: string;
  thesis: string;
  points: string[];
};

export type MindsetStory = {
  id: string;
  person: string;
  source: string; // channel / interview
  videoId: string;
  oneLineStory: string;
  themes: MindsetTheme[];
  quotes: string[];
};

export const MINDSET_STORIES: MindsetStory[] = [
  {
    id: "andy-crypstocks-all-in",
    person: "Andy Crypstocks",
    source: "Theo Derick — #DariNol",
    videoId: "seqhQpImJDo",
    oneLineStory:
      "Anak tukang potong ikan dari Singkawang yang sempat kerja sampai 5 pekerjaan sehari, lalu all-in seluruh tabungannya ke crypto — tahan rugi hingga 80% selama ~3 tahun sebelum siklus 2020–2021 melipatgandakan hidupnya 'dari cacing jadi naga'.",
    quotes: [
      "Jurus pemungkas di crypto bukan soal jenius atau hoki, tapi being early — masuk sedini mungkin.",
      "Bangun conviction untuk mengerti, bukan untuk mencari pembenaran; ngerti dulu, baru beli.",
      "Bermimpilah setinggi langit, tapi yang bertanggung jawab — kalau gagalmu bikin keluarga tak bisa makan, itu egois, bukan pemimpi.",
      "Selama bukan scam dan bukan nol, turun 80% itu peluang beli, bukan alasan panik — teknologi bersiklus.",
      "Knowing yourself is enough; nasibmu adalah tanggung jawabmu, bukan tanggung jawab mentor atau orang tuamu.",
    ],
    themes: [
      {
        topic: "mindset",
        title: "Mimpi besar karena tak punya apa-apa untuk hilang",
        thesis:
          "Justru karena berangkat dari nol, dia merasa punya lisensi untuk bermimpi setinggi langit dan berani ambil risiko ekstrem yang orang 'normal' tidak berani.",
        points: [
          "Prinsipnya 'cowok jangan miskin' — pupuk ketidakpuasan atas kondisi hidup sebagai bahan bakar, bukan alasan menyerah.",
          "'I have nothing to lose' — kalau gagal, paling banter pulang jualan bakmi; skenario terburuk sudah diterima duluan secara mental.",
          "Sadari kesuksesannya anomali (peluang 0,0 sekian persen) — jangan romantisasi; kaya bukan cuma soal uang tapi mindset, psikologi, lingkungan, dan latar belakang.",
          "Jadi 'lone wolf': jalan sendiri, pimpin diri sendiri, tak mudah terpengaruh omongan teman/lingkungan.",
          "Pola pikir para idolanya (Ali, Bruce Lee, Ronaldo): kerja tanpa hitung-hitungan, yang penting sampai batas.",
        ],
      },
      {
        topic: "work-ethic",
        title: "Etos kerja serabutan tanpa rem",
        thesis:
          "Sebelum crypto berbuah, dia menumpuk penghasilan lewat sebanyak mungkin pekerjaan sekaligus dan bekerja sampai 'sakit' tanpa jeda.",
        points: [
          "Bisa jalankan sampai 5 pekerjaan sehari: jual asuransi pagi, prospek di Tanah Abang siang, antar barang JNE sore, jual tas/selai/voucher online malam.",
          "Manfaatkan tiap menit — kombinasikan pekerjaan offline & online supaya tak ada waktu kosong.",
          "Filosofi 'get the job done': tak menghitung jam, yang penting selesai — tak peduli hujan, badai, atau lagi sakit.",
          "Rajin datang ke seminar gratisan: dapat ilmu sekaligus makan gratis — efisiensi maksimal.",
          "Ditolak 13 perusahaan justru disyukuri, karena kerja kantoran memang bukan jalannya.",
          "Dia sendiri menyebut ini 'toxic positivity' & tak menyuruh semua orang meniru — tidak semua cocok dengan ritme ini.",
        ],
      },
      {
        topic: "risk-decision",
        title: "All-in tabungan, tapi mimpi yang bertanggung jawab",
        thesis:
          "Dia benar-benar all-in, tapi keputusan itu 'diizinkan' karena masih lajang tanpa tanggungan — risiko ekstrem hanya boleh diambil kalau kegagalan hanya membunuh dirimu sendiri.",
        points: [
          "Konfirmasi all-in: semua duit masuk crypto; porsi saham kecil karena conviction-nya kecil di sana.",
          "Aturan risikonya: kalau punya buffer/privilege & 'matinya mati sendirian', ambil risiko besar; tapi kalau gagalmu bikin adik putus sekolah / orang tua tak bisa makan, itu egois.",
          "Sempat berhenti kirim uang bulanan ke orang tua untuk fokus membangun mimpi — bisa karena 5 saudara lain masih menopang & ayah masih bekerja (bukan sandwich generation).",
          "Kontras dengan yang all-in saat sudah punya anak-istri — Andy menilai dirinya lebih 'aman' ambil risiko karena masih single.",
          "Sempat menawarkan putus ke pacar (2020, sebelum crypto meledak) karena merasa gagal — bukti dia siap menerima kekalahan, bukan cuma siap menang.",
        ],
      },
      {
        topic: "crypto-strategy",
        title: "Being early + beli saat sepi & turun",
        thesis:
          "Strateginya bertumpu pada masuk sedini mungkin ke teknologi eksperimental dan mencicil terus justru ketika harga jatuh dan orang lain menjauh.",
        points: [
          "'Being early as soon as possible' — kekayaan besar lahir dari masuk saat sesuatu masih baru dicoba.",
          "Dollar-cost averaging ~1000 hari (2017 akhir–2020): tiap ada uang langsung dibelikan, termasuk saat porto minus 80%.",
          "Beli saat aset 'tidak menarik & tidak ada harga' — analogi bangun di lahan rawa yang belum dilirik orang.",
          "Sandarkan tesis pada Halving (Mei 2020) sebagai 'ilmu eksak': suplai dipotong setengah otomatis, menahan super-inflasi.",
          "Riset dari makro sampai teknis — utang negara, M2, fiat; referensi buku 'The Bitcoin Standard' & 'The Fiat Standard'.",
          "Untuk pemula mulai dari yang paling aman (Bitcoin only); contohnya beli ETH terakhir di Rp5jt lalu naik ke Rp40–60jt.",
          "Prinsip sama bisa dipakai ke aset 'early' lain yang punya masa depan (mis. saham Nvidia, tema Longevity).",
        ],
      },
      {
        topic: "discipline",
        title: "Conviction (bukan justifikasi) & disiplin exit",
        thesis:
          "Dia membedakan keyakinan berbasis pemahaman dari pembenaran diri, tahan terhadap cemoohan, dan keluar berdasarkan hitungan — bukan emosi.",
        points: [
          "'Ngerti dulu baru beli' — conviction dibangun dari memahami teknologi (sampai belajar mining), bukan mencari pembenaran atas posisi rugi.",
          "Logika bertahan saat -80%: selama bukan scam, bukan nol, ada adopsi, dan regulasi makin positif, teknologi bersiklus & akan pulih.",
          "Tidak baperan: di-unfollow/diblok karena terus bahas crypto sejak 2018, tapi kritik dipakai introspeksi ('what if mereka benar?').",
          "Tidak menyalahkan siapa pun saat rugi — pasar masih eksperimental & muda; tanggung jawab ada di diri sendiri untuk belajar.",
          "Exit pakai indikator terukur: market cap, size, dan tokenomics — saat angkanya 'sudah tidak masuk akal', saatnya jual.",
          "April 2021 paksa cash out saat pasar puncak (bahkan 'rebut' HP pacar yang menolak jual) — market langsung rontok setelahnya.",
        ],
      },
      {
        topic: "lesson-learned",
        title: "Setelah kaya: kenali dirimu & nasib tanggung jawabmu",
        thesis:
          "Uang tidak mengubah orang yang paham dirinya; kekayaan jadi alat mewujudkan mimpi, dan hasil hidup adalah tanggung jawab pribadi.",
        points: [
          "'Uang bukan mengubah orang — itu mengubah kalau kamu tidak ngerti'; dia tetap makan warteg karena memang suka.",
          "Knowing yourself is enough: tahu persis apa yang bikin happy sehingga tak terjebak flexing (Lambo/jam mahal).",
          "Takut pensiun total ('jadi bodoh & gemuk') — pilih tetap produktif; kekayaan dipakai mewujudkan mimpi lama (dulu ingin jadi bintang film, kini investasi film).",
          "Investasi lanjutan tetap 'bertanggung jawab': hanya masuk bidang yang dipahami seluk-beluk & tren masa depannya (film, gym, RS, sekolah, longevity).",
          "Banyak yang dapat momentum tapi gagal bertahan — bertahan lebih sulit daripada meledak.",
          "Yang paling susah bukan memulai, tapi menerima kenyataan bahwa kamu akan gagal — kegagalan fase wajib menuju sukses berikutnya.",
        ],
      },
    ],
  },
];
