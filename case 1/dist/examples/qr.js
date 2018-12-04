var iprequest = {
    data: "foobar",
    timeout: 60,
    request: {
        "credentials": [
            {
                "credential": "irma-demo.MijnOverheid.address",
                "attributes": {
                    "country": "The Netherlands",
                    "city": "Nijmegen",
                    "street": "Toernooiveld 212",
                    "zipcode": "6525 EC",
                },
            },
        ],
        "disclose": [
            {
                "label": "Age (higher)",
                "attributes": {
                    "irma-demo.MijnOverheid.ageHigher": "present",
                },
            },
        ],
    },
};

var apiServer = "https://demo.irmacard.org/tomcat/irma_api_server/api/v2/";

$(function() {
    IRMA.init(apiServer);

    var showWarning = function(errorcode, msg) {
        $("#alert_box").html('<div class="alert alert-warning" role="alert">'
                             + '<strong>Warning:</strong> '
                             + msg + '</div>');
    };

    var showError = function (errorcode, msg) {
        $("#alert_box").html('<div class="alert alert-danger" role="alert">'
                             + '<strong>Error:</strong> '
                             + msg + '</div>');
    };

    var success_fun = function(data) {
        $("#alert_box").html('<div class="alert alert-success" role="alert">'
                             + '<strong>Success:</strong> Credentials issued </div>');
    };

    $("#irma_btn").on("click", function() {
        // Clear errors
        $(".form-group").removeClass("has-error");
        $("#alert_box").empty();

        // Ready&Validate fields
        var error = false;
        var street = $("#inputStreet").prop("value");
        if (street === "") {
            error = true;
            $("#groupStreet").addClass("has-error");
        }

        var zipcode = $("#inputZipCode").prop("value");
        if (zipcode === "") {
            error = true;
            $("#groupZipCode").addClass("has-error");
        }

        var city = $("#inputCity").prop("value");
        if (city === "") {
            error = true;
            $("#groupCity").addClass("has-error");
        }

        var country = $("#inputCountry").prop("value");
        if (country === "") {
            error = true;
            $("#groupCountry").addClass("has-error");
        }

        var attributes = {
            "country": country,
            "city": city,
            "street": street,
            "zipcode": zipcode
        };
        console.log(attributes);

        iprequest.request.credentials[0].attributes = attributes;
        console.log(iprequest);
        if (error) {
            showWarning("", "Fields may not be empty");
            return;
        }

        var jwt = IRMA.createUnsignedIssuanceJWT(iprequest);
        var actionPath = apiServer + "issue/";

        var xhr = new XMLHttpRequest();
        xhr.open("POST", encodeURI(actionPath));
        xhr.setRequestHeader("Content-Type", "text/plain");
        xhr.onload = function() {
            var sessionData = JSON.parse(xhr.responseText);
            var sessionPackage = {
                irmaqr: "issuing",
                v: sessionData.v,
                vmax: sessionData.vmax,
                u: actionPath + sessionData.u,
            };
            IRMA.issueFromQr(sessionPackage, success_fun, showWarning, showError);
        };
        xhr.send(jwt);
    });
});
