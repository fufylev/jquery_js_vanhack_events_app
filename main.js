/**
 * Assumptions:
 * 1. local Storage is being used as a Data Base
 * 2. single modal container is being used
 * 3. it was not clear from instruction of how should user share the event with friends - I applied two options
 * 4. I attached only available link from VanHack Event Page, thus manually created events (fake) are without links
 */

const modalOverLay = $('.overlay');
const modal = $('.modal');
const modalClose = $('.modal-close');
const modalContainer = $('.modal-container');

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function getDateFormatted(givenDate) {
    const date = new Date(givenDate);
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
}

/**
 * function close the modal window and clear is's container
 */
function onModalClose() {
    modalOverLay.hide();
    modal.empty();
}

// close modal window on "close button" press
modalClose.click(() => {
    onModalClose();
});

// close modal window if user pressed anywhere around the modal window itself
modalContainer.click(() => {
    if (event.target.classList.contains('overlay')) {
        onModalClose()
    }
});

/**
 * As per "HackerRank" requirements - to show in this sequence
 * @type {string[]}
 */
const eventsMapByPriorityToShow = [
    'leaps',
    'recruitingMissions',
    'vanHackathon',
    'meetUps',
    'premiumOnly',
    'openWebinar'
];

const app = {
    init() {
        let applied = {};
        // upload DB from localStorage
        const db = JSON.parse(localStorage.getItem('userData'));

        // map events and render them
        eventsMapByPriorityToShow.forEach(eventTopic => {
            const eventsByTopic = events[eventTopic];
            if (Object.keys(eventsByTopic).length > 0) {
                Object.keys(eventsByTopic).forEach(key => {
                    applied = {
                        ...applied,
                        [`${key}`]: {
                            ifApplied: false
                        }
                    };

                    // if DB exists, this code will be bypassed
                    if (Object.keys(db).length <= 0) {
                        localStorage.setItem('userData', JSON.stringify(applied));
                    }

                    // create new Event
                    const eventCard = new EventCard({...eventsByTopic[key]});
                    // start it's render
                    eventCard.renderEvent();
                });
            }
        });
    }
};


class EventCard {
    constructor({id, type, links, eventTitle, dates, location, details}) {
        this.id = id;
        this.type = type;
        this.links = links;
        this.eventTitle = eventTitle;
        this.dates = dates;
        this.location = location;
        this.details = details;
        this.containerUpcomingEvents = 'next-events';
        this.containerPastEvents = 'past-events';
    }

    renderEvent = () => {
        const $eventCardContainer = $('<div />', {
            class: 'event-card-container',
            'data-id': this.id,
        });

        const $eventCardBox = $('<div />', {
            class: 'event-card-box',
        });

        const $upcomingDetails = $(`<h3>Details are coming soon ...</h3>`);

        const premiumWebinar = $(`
            <div class="special"><i class="fas fa-lock"></i><span>&nbsp;Premium-only!</span> </div>
        `);

        const openWebinar = $(`
            <div class="special"><i class="fas fa-lock-open"></i>&nbsp;<span>Open for all webinar!</span></div>
        `);

        const $eventCardContent = $(`
            <div class="event-bg-img-container" data-event-container=${this.id}>
                <div class="event-bg-img" style="background-image: url(${this.links.eventImg})!important"></div>
            </div>
            <div class="event-card">
                <div class="event-card-heading">${this.eventTitle}</div>
                <div class="event-card-dates">${getDateFormatted(this.dates.from)} - ${getDateFormatted(this.dates.to)}</div>
                <div class="event-card-location">
                   <i class="fas fa-map-marker-alt"></i> ${this.location.city} - ${this.location.country}
                </div>
                <div class="event-card-deadline">
                    <div class="event-card-deadline-head">Deadline: &nbsp;</div>
                    <div class="event-card-deadline-date">${getDateFormatted(this.dates.deadline)} </div>
                </div>
                <div class="event-card-btn-container" data-details-buttons-id=${this.id}>
                    <div data-url-id=${this.id} class="ssk-group ssk-round" 
                         data-url=${this.links.eventUrl}
                         data-text="You can get more info by following this link">
                        <button class="ssk ssk-link" data-link-id=${this.id}></button>
                        <a href="" target="_blank" class="ssk ssk-email"></a>
                    </div>
                    <button class="event-card-btn" data-details-btn-id=${this.id}>SEE DETAILS</button>
                </div>
            </div>
        `);

        // assemble containers on the page - nested elements
        $eventCardContent.appendTo($eventCardBox);
        $eventCardBox.appendTo($eventCardContainer);

        const startDate = new Date(this.dates.from);
        const today = new Date();

        // render events depending on current date
        if (today > startDate) {
            $eventCardContainer.appendTo($(`.${this.containerPastEvents}`));
        } else {
            $eventCardContainer.appendTo($(`.${this.containerUpcomingEvents}`));
        }

        // visually distinguish from 'open for all' webinars
        if (this.type === 'premiumOnly') {
            premiumWebinar.appendTo($(`div[data-event-container|=${this.id}]`));
        } else if (this.type === 'openWebinar') {
            openWebinar.appendTo($(`div[data-event-container|=${this.id}]`));
        }

        // remove buttons if no details
        if (this.details.event.length === 0) {
            $(`div[data-details-buttons-id|=${this.id}]`).html($upcomingDetails);
        }

        // remove links if no page link
        if (this.links.eventUrl.length === 0) {
            $(`div[data-url-id|=${this.id}]`).remove();
        }

        // activate button's listeners
        this.buttonsListenerHandler();
    };

    // show event's details if any
    renderContext() {
        if (this.details.event.length > 0) {
            this.details.event.forEach(text => {
                $(`<div class="event-details-text">${text}</div>`).appendTo($('.event-details'))
            });
        } else {
            $('.event-details').remove();
        }

        if (this.details.candidates.length > 0) {
            this.details.candidates.forEach(text => {
                $(`<div class="event-details-text">${text}</div>`).appendTo($('.candidate-details'))
            })
        } else {
            $('.candidate-details').remove();
        }
    }

    // context for modal showing the event's details container
    renderDetails() {
        // clear modal prior to show
        modal.empty();
        // open the modal window
        modalOverLay.show();

        const data = JSON.parse(localStorage.getItem('userData'))[this.id];
        const button = data.ifApplied
            ? $(`<div class="applied-btn">You applied!&ensp;
                    <span style="font-size: 2em; color: #e4dd40;">
                      <i class="far fa-thumbs-up"></i>
                    </span></div>
                `)
            : $(`<button class="apply-btn" data-apply-btn-id=${this.id} id="${this.id}">APPLY</button>`);

        const details = $(`
            <div class="details-container">
                <div class="event-bg-img-container">
                    <div class="details-bg-img" style="background-image: url(${this.links.eventImg})!important"></div>
                </div>
                <div class="details-content">
                    <div class="details-heading"><h2>${this.eventTitle}</h2></div>
                    <div class="details-dates">
                        <span>${getDateFormatted(this.dates.from)}</span><span>&nbsp;-&nbsp;${getDateFormatted(this.dates.to)}</span>
                    </div>
                    <div class="event-details"><h3 class="event-details-headings">The Event</h3></div>
                    <div class="candidate-details"><h3 class="event-details-headings">The Candidates</h3></div>
                </div>
                <div class="details-btn-container" data-details-buttons-id=${this.id}>
                    <div class="apply-btn" data-see-event-id=${this.id}><a href=${this.links.eventUrl}>SEE EVENT PAGE</a></div>
                </div>
            </div>
        `);

        if (this.type === 'premiumOnly') {
            $(`<div style="text-align: center; padding: 10px!important;">
                    <div style="font-size: 3em;"><i class="far fa-smile"></i></div>
                    <div style="font-size: 18px; color: #434343; line-height: 2em">To enter this webinar you you must be a "VanHack Premium" member</div>
                    <div>
                        <a href="https://vanhack.com/premium/" style="line-height: 2em; font-size: 18px; color: #3C74CF">Buy a Premium membership</a>
                    </div>
                </div>`).appendTo(modal);
        } else {
            details.appendTo(modal);
            button.appendTo($('.details-btn-container'));
        }

        this.renderContext();
        this.buttonsListenerHandler()

        // remove links if no page link
        if (this.links.eventUrl.length === 0) {
            $(`div[data-see-event-id|=${this.id}]`).remove();
        }
    }

    // handler for text copy to Clipboard
    copyToClipboardAction() {
        const copyText = document.getElementById("eventUrl");

        /* Select the text field */
        copyText.select();
        copyText.setSelectionRange(0, 99999); /*For mobile devices*/

        /* Copy the text inside the text field */
        document.execCommand("copy");

        $('.copy-to-clipboard-alert').remove();
        $(`<div class="copy-to-clipboard-alert">Link: <strong>"${copyText.value}"</strong> was copied to Clipboard</div>`).appendTo('.copy-to-clipboard');
    }

    // opens a modal window and insert the input inside
    copyToClipboardRender() {
        // clear modal prior to show
        modal.empty();
        // open the modal window
        modalOverLay.show();

        const $modalToCopy = $(`
            <div class="copy-to-clipboard">
                <input type="text" value=${this.links.eventUrl} id="eventUrl" class="copy-to-clipboard-text">
                <button data-copy-id=${this.id} class="copy-to-clipboard-button">Copy <i class="fas fa-link"></i> to clipboard</button>
            </div>
        `);

        $modalToCopy.appendTo(modal);
        this.buttonsListenerHandler()
    }

    // apply to event handler
    applyToEvent() {
        const id = this.id;
        const db = JSON.parse(localStorage.getItem('userData'));
        // update data base
        localStorage.setItem('userData', JSON.stringify({...db, [id]: {ifApplied: true}}));
        // remove button from container
        $(`#${this.id}`).remove();

        // inform user that he has applied
        alert(`You've successfully applied. Your application is being reviewed`);
        // change element to text
        $(`<div class="applied-btn">You applied!&ensp;
            <span style="font-size: 2em; color: #e4dd40;">
              <i class="far fa-thumbs-up"></i>
            </span></div>`).appendTo('.details-btn-container');
    }

    // buttons' listeners handler
    buttonsListenerHandler() {
        $(`button[data-details-btn-id|=${this.id}]`).click(() => {
            this.renderDetails();
        });

        $(`button[data-apply-btn-id|=${this.id}]`).click(() => {
            this.applyToEvent();
        });

        $(`button[data-link-id|=${this.id}]`).click(() => {
            this.copyToClipboardRender();
        });

        $(`button[data-copy-id|=${this.id}]`).click(() => {
            this.copyToClipboardAction();
        });
    }
}

// start-up the App
$(document).ready(() => {
    // initiate the DB
    if (!localStorage.getItem('userData')) {
        localStorage.setItem('userData', JSON.stringify({}))
    }
    // start up the App
    app.init();

    // initiate share script
    SocialShareKit.init();
});