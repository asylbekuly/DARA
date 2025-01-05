// Ждем загрузки DOM
$(document).ready(function () {
    // Управление вкладками
    $(".account-settings-links a").on("click", function (e) {
        e.preventDefault();
        $(".account-settings-links a").removeClass("active");
        $(this).addClass("active");
        $(".tab-content .tab-pane").removeClass("active show");
        $($(this).attr("href")).addClass("active show");
    });

    // Загрузка аватара
    $(".account-settings-fileinput").on("change", function (e) {
        const reader = new FileReader();
        reader.onload = function (e) {
            $(".ui-w-80").attr("src", e.target.result);
        };
        reader.readAsDataURL(this.files[0]);
    });

    // Валидация пароля
    $("#account-change-password .form-control").on("input", function () {
        const newPassword = $("#account-change-password input[type='password']").eq(1).val();
        const repeatPassword = $("#account-change-password input[type='password']").eq(2).val();

        if (newPassword && repeatPassword && newPassword !== repeatPassword) {
            $("#account-change-password input[type='password']").eq(2).addClass("is-invalid");
        } else {
            $("#account-change-password input[type='password']").eq(2).removeClass("is-invalid");
        }
    });

    // Обработка кнопки "Save changes"
    $(".btn-primary").on("click", function () {
        const activeTab = $(".account-settings-links a.active").text();
        alert(`Settings saved for ${activeTab}`);
    });

    // Обработка кнопки "Cancel"
    $(".btn-default").on("click", function () {
        if (confirm("Are you sure you want to cancel changes?")) {
            location.reload();
        }
    });

    // Проверка активности чекбоксов (например, для уведомлений)
    $(".switcher-input").on("change", function () {
        const isChecked = $(this).is(":checked");
        const label = $(this).closest(".form-group").find(".switcher-label").text();

        console.log(`${label} is now ${isChecked ? "enabled" : "disabled"}`);
    });
});
