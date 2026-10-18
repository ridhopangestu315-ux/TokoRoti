
/* =================================
   1. DATA KERANJANG
================================= */

let keranjang = JSON.parse(
    localStorage.getItem("keranjangRoti")
) || [];


/* =================================
   2. NOTIFIKASI TOAST
================================= */

let timerToast;

function tampilkanToast(judul, pesan) {
    const toast = document.getElementById("toast");
    const judulToast = document.getElementById("toast-title");
    const pesanToast = document.getElementById("toast-message");
    const ikonToast = toast.querySelector(".toast-icon");

    clearTimeout(timerToast);

    judulToast.textContent = judul;
    pesanToast.textContent = pesan;
    ikonToast.textContent = "✓";

    toast.classList.add("show");

    timerToast = setTimeout(function() {
        toast.classList.remove("show");
    }, 3000);
}

document.getElementById("toast-close").addEventListener("click", function() {
    clearTimeout(timerToast);
    document.getElementById("toast").classList.remove("show");
});


/* =================================
   3. SIMPAN KERANJANG
================================= */

function simpanKeranjang() {
    localStorage.setItem(
        "keranjangRoti",
        JSON.stringify(keranjang)
    );
}


/* =================================
   4. FORMAT HARGA RUPIAH
================================= */

function formatRupiah(angka) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(angka);
}


/* =================================
   5. AMBIL DATA PRODUK
================================= */

function ambilDataProduk(tombol) {
    const kartu = tombol.closest(".product-card");

    const nama = kartu.querySelector("h3").textContent.trim();

    const hargaText = kartu.querySelector(".price").textContent;

    const harga = Number(hargaText.replace(/[^\d]/g, ""));

    const gambar = kartu.querySelector("img").getAttribute("src");

    return {
        nama: nama,
        harga: harga,
        gambar: gambar
    };
}


/* =================================
   6. TAMBAH PRODUK KE KERANJANG
================================= */

document.querySelectorAll(".btn-product").forEach(function(tombol) {
    tombol.addEventListener("click", function() {
        const produk = ambilDataProduk(tombol);

        const produkAda = keranjang.find(function(item) {
            return item.nama === produk.nama;
        });

        if (produkAda) {
            produkAda.jumlah++;
        } else {
            keranjang.push({
                ...produk,
                jumlah: 1
            });
        }

        simpanKeranjang();
        perbaruiJumlahKeranjang();

        tampilkanToast(
            "Berhasil ditambahkan!",
            produk.nama + " masuk ke keranjang."
        );
    });
});


/* =================================
   7. PERBARUI JUMLAH KERANJANG
================================= */

function perbaruiJumlahKeranjang() {
    const totalBarang = keranjang.reduce(function(total, item) {
        return total + item.jumlah;
    }, 0);

    const tombolKeranjang = document.querySelector(
        '.nav-icon[href="#keranjang"]'
    );

    if (tombolKeranjang) {
        tombolKeranjang.textContent = "🛒 " + totalBarang;
    }
}


/* =================================
   8. TAMPILAN KERANJANG
================================= */

const tampilanKeranjang = document.createElement("div");

tampilanKeranjang.id = "cart-modal";

tampilanKeranjang.innerHTML = `
    <div class="cart-box">
        <button id="tutup-keranjang" type="button">
            ✕ Tutup
        </button>

        <h2>Keranjang Belanja</h2>

        <div id="isi-keranjang"></div>

        <h3 id="total-belanja">Total: Rp 0</h3>

        <button id="kosongkan-keranjang" type="button">
            Kosongkan Keranjang
        </button>
    </div>
`;

document.body.appendChild(tampilanKeranjang);


/* =================================
   9. BUKA KERANJANG
================================= */

const tombolBukaKeranjang = document.querySelector(
    '.nav-icon[href="#keranjang"]'
);

if (tombolBukaKeranjang) {
    tombolBukaKeranjang.addEventListener("click", function(event) {
        event.preventDefault();

        tampilkanKeranjang();

        tampilanKeranjang.style.display = "flex";
    });
}


/* =================================
   10. TUTUP KERANJANG
================================= */

document.getElementById("tutup-keranjang")
    .addEventListener("click", function() {
        tampilanKeranjang.style.display = "none";
    });

// Tutup jika pengguna menekan area luar keranjang
tampilanKeranjang.addEventListener("click", function(event) {
    if (event.target === tampilanKeranjang) {
        tampilanKeranjang.style.display = "none";
    }
});


/* =================================
   11. TAMPILKAN ISI KERANJANG
================================= */

function tampilkanKeranjang() {
    const isi = document.getElementById("isi-keranjang");
    const totalElement = document.getElementById("total-belanja");

    isi.innerHTML = "";

    if (keranjang.length === 0) {
        isi.textContent = "Keranjang kamu masih kosong.";
        totalElement.textContent = "Total: Rp 0";
        return;
    }

    let total = 0;

    keranjang.forEach(function(item, index) {
        const subtotal = item.harga * item.jumlah;

        total += subtotal;

        const baris = document.createElement("div");

        baris.className = "cart-item";

        baris.innerHTML = `
            <img src="${item.gambar}" alt="">

            <div class="cart-item-info">
                <strong>${item.nama}</strong>

                <p>${formatRupiah(item.harga)}</p>

                <div class="cart-controls">
                    <button
                        type="button"
                        data-aksi="kurang"
                        data-index="${index}">
                        −
                    </button>

                    <span>${item.jumlah}</span>

                    <button
                        type="button"
                        data-aksi="tambah"
                        data-index="${index}">
                        +
                    </button>

                    <button
                        type="button"
                        data-aksi="hapus"
                        data-index="${index}">
                        Hapus
                    </button>
                </div>
            </div>

            <strong>${formatRupiah(subtotal)}</strong>
        `;

        isi.appendChild(baris);
    });

    totalElement.textContent = "Total: " + formatRupiah(total);
}


/* =================================
   12. TAMBAH, KURANG, DAN HAPUS
================================= */

document.getElementById("isi-keranjang")
    .addEventListener("click", function(event) {
        const tombol = event.target.closest("button");

        if (!tombol) return;

        const index = Number(tombol.dataset.index);
        const aksi = tombol.dataset.aksi;

        if (!keranjang[index]) return;

        if (aksi === "tambah") {
            keranjang[index].jumlah++;
        }

        if (aksi === "kurang") {
            keranjang[index].jumlah--;

            if (keranjang[index].jumlah <= 0) {
                keranjang.splice(index, 1);
            }
        }

        if (aksi === "hapus") {
            keranjang.splice(index, 1);

            tampilkanToast(
                "Produk dihapus",
                "Produk telah dihapus dari keranjang."
            );
        }

        simpanKeranjang();
        perbaruiJumlahKeranjang();
        tampilkanKeranjang();
    });


/* =================================
   13. KOSONGKAN KERANJANG
================================= */

document.getElementById("kosongkan-keranjang")
    .addEventListener("click", function() {
        if (keranjang.length === 0) {
            tampilkanToast(
                "Keranjang kosong",
                "Belum ada produk yang perlu dihapus."
            );
            return;
        }

        keranjang = [];

        simpanKeranjang();
        perbaruiJumlahKeranjang();
        tampilkanKeranjang();

        tampilkanToast(
            "Keranjang dikosongkan",
            "Semua produk berhasil dihapus."
        );
    });


/* =================================
   14. PENCARIAN PRODUK
================================= */

const formPencarian = document.querySelector(".search-box");

if (formPencarian) {
    formPencarian.addEventListener("submit", function(event) {
        event.preventDefault();

        const input = formPencarian.querySelector("input");

        const kataKunci = input.value.trim().toLowerCase();

        const semuaProduk = document.querySelectorAll(".product-card");

        let jumlahCocok = 0;

        semuaProduk.forEach(function(kartu) {
            const nama = kartu.querySelector("h3")
                .textContent.toLowerCase();

            const cocok = nama.includes(kataKunci);

            kartu.style.display = cocok ? "" : "none";

            if (cocok) {
                jumlahCocok++;
            }
        });

        document.getElementById("produk").scrollIntoView({
            behavior: "smooth"
        });

        if (jumlahCocok === 0) {
            tampilkanToast(
                "Produk tidak ditemukan",
                "Coba gunakan nama roti yang berbeda."
            );
        } else {
            tampilkanToast(
                "Pencarian selesai",
                "Ditemukan " + jumlahCocok + " produk."
            );
        }
    });
}


/* =================================
   15. JALANKAN SAAT HALAMAN DIBUKA
================================= */

perbaruiJumlahKeranjang();
