(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
let MobileCheck = function () {
    var check = false;
    (function (a) {
        /*eslint-disable-next-line*/
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};

module.exports = {
    MobileCheck
};
},{}],2:[function(require,module,exports){
let agents = require("./agents")

const IntaSend = {
    _redirectURL: "",
    _publicAPIKey: "",
    _element: "tp_button",
    _btnElement: Object,
    _dataset: Object,
    _live: true,
    setup(obj) {
        IntaSend._publicAPIKey = obj.publicAPIKey
        IntaSend._redirectURL = obj.redirectURL
        IntaSend._live = obj.live
        IntaSend._element = obj.element || IntaSend._element
        IntaSend.is_mobile = agents.MobileCheck()

        IntaSend._btnElement = document.getElementsByClassName(IntaSend._element)
        if (IntaSend._btnElement) {
            for (let i = 0; i < IntaSend._btnElement.length; ++i) {
                let btn = IntaSend._btnElement[i]
                btn.addEventListener('click', function () {
                    let dataset = btn.dataset
                    IntaSend.loadPaymentModal(dataset)
                })
            }
        }

        // HANDLE NEW MESSAGE NOTIFICATIONS
        function bindEvent(element, eventName, eventHandler) {
            if (element.addEventListener) {
                element.addEventListener(eventName, eventHandler, false);
            } else if (element.attachEvent) {
                element.attachEvent('on' + eventName, eventHandler);
            }
        }

        bindEvent(window, 'message', function (e) {
            if (e.data.message) {
                if (e.data.message.identitier == 'intasend-status-update-cdrtl') {
                    if (e.data.message.state === "COMPLETE") {
                        if (IntaSend._redirectURL) {
                            window.location.href = IntaSend._redirectURL
                        }
                    }
                } else if (e.data.message.identitier == 'intasend-close-modal-cdrtl') {
                    IntaSend.clearElements()
                }
            }
        });


        // End message events

        return IntaSend
    },
    run(obj) {
        IntaSend.loadPaymentModal(obj)
    },
    loadPaymentModal(dataset) {
        dataset.callback_url = IntaSend._redirectURL
        dataset.public_key = IntaSend._publicAPIKey
        dataset.host = window.location.protocol + "//" + window.location.host
        dataset.is_mobile = IntaSend.is_mobile

        IntaSend.clearElements()
        let modalContent = IntaSend.prepareModal()
        if (!IntaSend.is_mobile) {
            IntaSend.closeModalIcon(modalContent)
        }
        let iframe = IntaSend.prepareFrame(modalContent, dataset)
        return iframe
    },
    clearElements() {
        let iframes = document.querySelectorAll('iframe');
        for (let i = 0; i < iframes.length; i++) {
            iframes[i].parentNode.removeChild(iframes[i]);
        }
        // Remove modals
        let modals = document.querySelectorAll('modal');
        for (let x = 0; x < modals.length; x++) {
            modals[x].parentNode.removeChild(modals[x]);
        }
    },
    prepareModal() {
        let modal = document.createElement("modal");
        modal.style.display = "flex"
        modal.style.position = "fixed"
        modal.style.zIndex = 1200
        modal.style.left = 0
        modal.style.top = 0
        modal.style.width = "100%"
        modal.style.height = "100%"
        modal.style.overflow = "auto"
        modal.style.backgroundColor = "rgb(0,0,0)"
        modal.style.backgroundColor = "rgba(0,0,0,0.7)"

        document.body.appendChild(modal);

        let modalContent = document.createElement("modal-content")
        if (IntaSend.is_mobile) {
            modalContent.style.width = "100%";
        } else {
            modalContent.style.width = "380px";
        }
        modalContent.style.height = "auto";
        modalContent.style.margin = "auto"
        modalContent.style.display = "block"
        if (!IntaSend.is_mobile) {
            modalContent.style.paddingTop = "20px"
            modalContent.style.backgroundColor = "transparent"
        } else {
            modalContent.style.paddingTop = "0px"
            modalContent.style.backgroundColor = "#ffffff"
        }
        modal.appendChild(modalContent)
        return modalContent
    },
    closeModalIcon(modalContent) {
        let iconHolder = document.createElement("div")
        let icon = document.createElement("div")
        icon.innerHTML = IntaSend._closeIconSVG()
        icon.style.cursor = "pointer"
        icon.style.marginRight = "-20px"
        icon.style.float = "right"
        iconHolder.style.display = "block"
        iconHolder.style.height = "10px"
        iconHolder.style.zIndex = 1250
        iconHolder.appendChild(icon)
        modalContent.appendChild(iconHolder)

        icon.addEventListener('click', function () {
            IntaSend.clearElements()
        })
    },
    prepareFrame(modalContent, dataset) {
        let params = new URLSearchParams(dataset).toString()
        let ifrm = document.createElement("iframe");
        if (IntaSend._live) {
            ifrm.setAttribute("src", "https://websdk.intasend.com/?" + params);
        } else {
            ifrm.setAttribute("src", "https://websdk-sandbox.intasend.com/?" + params);
        }
        ifrm.style.width = "100%";
        if (!IntaSend.is_mobile) {
            ifrm.style.minHeight = "570px";
        } else {
            ifrm.style.minHeight = "100vh";
        }
        ifrm.style.border = 0;
        ifrm.frameborder = 0
        ifrm.scrolling = "no"

        modalContent.appendChild(ifrm)
        return ifrm
    },
    _closeIconSVG() {
        return '<svg height="10pt" fill="#999" viewBox="0 0 329.26933 329" width="10pt" xmlns="http://www.w3.org/2000/svg"><path d="m194.800781 164.769531 128.210938-128.214843c8.34375-8.339844 8.34375-21.824219 0-30.164063-8.339844-8.339844-21.824219-8.339844-30.164063 0l-128.214844 128.214844-128.210937-128.214844c-8.34375-8.339844-21.824219-8.339844-30.164063 0-8.34375 8.339844-8.34375 21.824219 0 30.164063l128.210938 128.214843-128.210938 128.214844c-8.34375 8.339844-8.34375 21.824219 0 30.164063 4.15625 4.160156 9.621094 6.25 15.082032 6.25 5.460937 0 10.921875-2.089844 15.082031-6.25l128.210937-128.214844 128.214844 128.214844c4.160156 4.160156 9.621094 6.25 15.082032 6.25 5.460937 0 10.921874-2.089844 15.082031-6.25 8.34375-8.339844 8.34375-21.824219 0-30.164063zm0 0"/></svg>'
    }
}

window.IntaSend = IntaSend;
module.exports = IntaSend;
},{"./agents":1}]},{},[2]);