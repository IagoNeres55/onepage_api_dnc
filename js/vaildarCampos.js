let nome = document.getElementById("name");
let email = document.getElementById("email");
let cep = document.getElementById("cep");
let footForm = document.getElementById("footForm");
let lat = document.getElementById("lat");
let lon = document.getElementById("lon");
let formulario = document.getElementById("formulario")
let textNomeErro = document.getElementById("textNomeErro")
let textEmailErro = document.getElementById("textEmailErro")
let textCepErro = document.getElementById("textCepErro")
let temperatura = document.getElementById("temperatura")
let textErroLatLong = document.getElementById("textErroLatLong")

function validarNome(nome) {
    if (nome.length <= 3) return true
    const regex = /^[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ '-]+$/;
    return regex.test(nome);
}
function validarEmail(email) {
    if (email.length <= 5) return true
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]+$/;
    return regex.test(email);
}

const validarCampos = () => {
    formulario.addEventListener('keydown', function validarName() {
        const inputName = validarNome(nome.value)
        if (!inputName) {
            nome.style.backgroundColor = "#facfcf"
            textNomeErro.innerHTML = "*Nome não pode conter caracteres especiais*"
        } else {
            nome.style.backgroundColor = "#f2f2f2"
            textNomeErro.innerHTML = ''
        }
        const inputEmail = validarEmail(email.value)
        if (!inputEmail) {
            email.style.backgroundColor = "#facfcf"
            textEmailErro.innerHTML = "*Digite o E-mail corretamente*"
        } else {
            email.style.backgroundColor = "#f2f2f2"
            textEmailErro.innerHTML = ''
        }
    });
}


cep.addEventListener('input', function (e) {
    let valor = e.target.value;
    valor = valor.replace(/\D/g, '');
    valor = valor.replace(/^(\d{5})(\d)/, '$1-$2');
    valor = valor.substring(0, 9);
    e.target.value = valor;
    if (valor.length === 9) {
        getCepInfo(valor)
    }
});


const getCepInfo = async (value) => {
    try {
        const res = await fetch(`https://viacep.com.br/ws/${value}/json/`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
        const data = await res.json();
        if (data.erro) {
            textCepErro.innerHTML = "*Cep digitado está incorreto*"
            cep.style.backgroundColor = "#facfcf"

            return
        }
        localStorage.setItem("cepStorage", JSON.stringify(data))
        updateLocation(data)
    } catch (error) {
        textCepErro.innerHTML = "*Cep digitado não encontrad*"
        cep.style.backgroundColor = "#facfcf"
        console.error(error)
    } finally {
        setTimeout(() => {
            textCepErro.innerHTML = ""
            cep.style.backgroundColor = "#f2f2f2"
        }, 4000);
    }
}

const updateLocation = (data) => {
    document.getElementById("lagradouro").innerHTML = data.logradouro
    document.getElementById("bairro").innerHTML = data.bairro
    document.getElementById("uf").innerHTML = data.uf
}

const submitInfo = async () => {
    try {
        const res = await fetch('https://api.sheetmonkey.io/form/2kYwKf4AHn3BJZ6XEaSQbx', {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nome: nome.value,
                email: email.value,
                cep: cep.value,
                longitude: lat.value,
                latitude: lon.value
            })
        })
        opentoast();
        clearInput();
    } catch (error) {
        openToastError();
        console.log(error)
    }
}
// formulario.addEventListener('submit', submitInfo)


function opentoast() {
    var meuToastEl = document.getElementById('mytoast');
    var meuToast = new bootstrap.Toast(meuToastEl);
    meuToast.show()
}

function openToastError() {
    var meuToastEl = document.getElementById('mytoastError');
    var meuToast = new bootstrap.Toast(meuToastEl);
    meuToast.show();

}

const getTemperature = async () => {

    if (!lat.value) {
        lat.style.backgroundColor = '#facfcf';
    } else {
        lat.style.backgroundColor = '#f2f2f2';
        textErroLatLong.innerHTML = '';
    }

    if (!lon.value) {
        lon.style.backgroundColor = '#facfcf';

    } else {
        lon.style.backgroundColor = '#f2f2f2';
        textErroLatLong.innerHTML = '';
    }

    if (!nome.value) {
        nome.style.backgroundColor = "#facfcf";
        textNomeErro.innerHTML = "*Preencha o campo Nome corretamente*";
    } else {
        nome.style.backgroundColor = "#f2f2f2";
        textNomeErro.innerHTML = '';
    }

    if (!email.value) {
        email.style.backgroundColor = "#facfcf";
        textEmailErro.innerHTML = "*Preencha o campo de E-mail corretamente*";
    } else {
        email.style.backgroundColor = "#f2f2f2";
        textEmailErro.innerHTML = '';
    }

    if (!cep.value) {
        cep.style.backgroundColor = "#facfcf";
        textCepErro.innerHTML = "*Preencha o campo Cep corretamente*";
    } else {
        cep.style.backgroundColor = "#f2f2f2";
        textCepErro.innerHTML = '';
    }

    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat.value}&longitude=${lon.value}&hourly=temperature_2m&forecast_days=1`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }

            }
        )
        const data = await response.json();
        const temp = data.hourly.temperature_2m
        const soma = temp.reduce((acumulador, currentValue) => acumulador + currentValue, 0)
        const valueTemp = Math.round(soma / temp.length)
        temperatura.innerHTML = valueTemp
        localStorage.setItem('valueTemperature', JSON.stringify(valueTemp))
        window.scrollTo(0, 1190);
        submitInfo();

    } catch (error) {
        textErroLatLong.innerHTML = '*Erro verifique se os campos estão corretos..*';
        lon.style.backgroundColor = '#facfcf';
        lat.style.backgroundColor = '#facfcf';
        console.log(error)
    }
}


const validarStorage = () => {
    const data = JSON.parse(localStorage.getItem('cepStorage'));
    const temp = JSON.parse(localStorage.getItem('valueTemperature'))
    if (data || temp) {
        updateLocation(data);
        temperatura.innerHTML = temp
        return
    }

}

const clearInput = () => {
    nome.value = ''
    cep.value = ''
    lon.value = ''
    lat.value = ''
    email.value = ''
}

validarCampos();
validarStorage();