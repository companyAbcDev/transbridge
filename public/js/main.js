
// 스크롤 막기
function disableScroll() {
    // 표준 방법
    document.body.style.overflow = 'hidden';
  
    // 크로스 브라우징을 위한 추가 설정
    document.documentElement.style.overflow = 'hidden';
  
    // 모바일에서의 스크롤을 막기 위한 설정
    document.body.style.position = 'fixed';
  }
  
  // 스크롤 허용
  function enableScroll() {
    // 표준 방법
    document.body.style.overflow = '';
  
    // 크로스 브라우징을 위한 추가 설정
    document.documentElement.style.overflow = '';
  
    // 모바일에서의 스크롤을 허용하기 위한 설정
    document.body.style.position = '';
  }
  

var lastScrollTop = 0;

function headerScrollMov() {
    let scrollPos = window.scrollY
    const headerDiv = document.querySelector('header');
    var currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    
    const topLinkBt = document.querySelector('.top-link-bt')
    if (topLinkBt) {
        if (currentScroll > 1000) {
            topLinkBt.style.opacity = '1'
            topLinkBt.style.pointerEvents = 'all'
        } else {
            topLinkBt.style.opacity = '0'
            topLinkBt.style.pointerEvents = 'none'
        }
    }
    if (currentScroll > lastScrollTop) {
        if (scrollPos > 50) {
            headerDiv.style.transform = 'translateY(-10rem)';
            headerDiv.style.opacity = '0'
            headerDiv.classList.add('headerScroll');
        } else {
            headerDiv.style.transform = 'translateY(0rem)';
            headerDiv.style.opacity = '1'
        }

    } else if (currentScroll < lastScrollTop) {
        if (scrollPos < 200) {
            headerDiv.classList.remove('headerScroll');
        }

        headerDiv.style.transform = 'translateY(0rem)';
        headerDiv.style.opacity = '1'
    }
    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
}
function headerminScrollMov() {
    let scrollPos = window.scrollY
    const headerDiv = document.querySelector('header');
    
    if (scrollPos < 200) {
        headerDiv.style.background = 'none';
    } else {
        headerDiv.style.background = 'rgba(0,0,0,0.5)';
    }
}

window.addEventListener("scroll", headerScrollMov);





function transactionAll() {
    const exploreDft = document.querySelector('.explore-dft');
    const exploreAll = document.querySelector('.explore-all');
    exploreDft.style.display = 'none';
    exploreAll.style.display = 'block';
}
function transactionBack() {
    const exploreDft = document.querySelector('.explore-dft');
    const exploreAll = document.querySelector('.explore-all');
    exploreDft.style.display = 'block';
    exploreAll.style.display = 'none';
}


function smoothScroll(target) {
    const targetSection = document.querySelector(target);
    const targetPosition = targetSection.offsetTop;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = 800; // Time in milliseconds to scroll

    let start = null;
    function step(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        window.scrollTo(0, easeInOutCubic(progress, startPosition, distance, duration));
        if (progress < duration) {
            window.requestAnimationFrame(step);
        }
    }

    function easeInOutCubic(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t * t + b;
        t -= 2;
        return c / 2 * (t * t * t + 2) + b;
    }

    window.requestAnimationFrame(step);
}

// Function to check if the element is in the viewport
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        // rect.top >= -500 &&
        rect.top + 100 <= (window.innerHeight || document.documentElement.clientHeight)
    );
}

// Function to reveal or hide the text based on scroll position
function toggleTextOnScroll() {
    const activeTexts = document.querySelectorAll(".b2b-content");

    activeTexts.forEach(function (activeText) {
        if (isElementInViewport(activeText)) {
            activeText.classList.add('b2b-content-active');
        } else {
            activeText.classList.remove('b2b-content-active');
        }
    });
}

// Attach the toggle function to the scroll event
window.addEventListener("scroll", toggleTextOnScroll);

// Initial check in case the elements are already in the viewport on page load
toggleTextOnScroll();




function b2bmainTap() {
    const b2bmainTapBt = document.querySelectorAll('input[name="b2b-tap"]');
    const b2bmainTapCont = document.querySelectorAll('.b2b-main-txt > div');
    for(i = 0; i < b2bmainTapCont.length; i++) {
        b2bmainTapCont[i].style.display = 'none';    
    }
    for (i = 0; i < b2bmainTapBt.length; i++) {
        if (b2bmainTapBt[i].checked) {
            b2bmainTapCont[i].style.display = 'block';
            break; 
        }
    }
}


// 헤더

function minMenuCom() {
    const minTapMom = document.querySelector('.min-tap');
    minTapMom.classList.toggle('min-tap-option');
    menuUpMov(minTapMom)
}
function menuUpMov(minTapMom) {
    const activeMenu = document.querySelectorAll(".min-tap-menu > li");
    activeMenu.forEach(function (activeMenu, index) {
        setTimeout(() => {
            if (minTapMom.classList.contains('min-tap-option')) {
                activeMenu.style.opacity = "1";
                activeMenu.style.transform = "translateY(0rem)";
                disableScroll();
            } else {
                activeMenu.style.opacity = "0";
                activeMenu.style.transform = "translateY(5rem)";
                enableScroll();
            }
        }, index * 100)
    });
}

