var select = $(".card-expiry-year"),
    year = new Date().getFullYear();

for (var i = 0; i < 12; i++) {
    select.append($("<option value='"+(i + year)+"' "+(i === 0 ? "selected" : "")+">"+(i + year)+"</option>"))
}

