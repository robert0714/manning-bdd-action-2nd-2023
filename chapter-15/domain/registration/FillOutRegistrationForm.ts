import { QuestionAdapter, Task } from '@serenity-js/core';
import {
    SpecifyCountryOfResidence,
    SpecifyEmailAddress,
    SpecifyFirstName,
    SpecifyHomeAddress,
    SpecifyLastName,
    SpecifyPassword,
    SpecifySalutation,
    SpecifySeatPreference,
    ToggleNewsletterSubscription,
    ToggleTermsAndConditions,
} from './form';
import { TravelerDetails } from '../../integration';

export const FillOutRegistrationForm =
    (travelerDetails: QuestionAdapter<TravelerDetails> | TravelerDetails) =>
        Task.where(`#actor fills out the registration form`,
            SpecifyEmailAddress(travelerDetails.email),
            SpecifyPassword(travelerDetails.password),
            SpecifySalutation(travelerDetails.title),
            SpecifyFirstName(travelerDetails.firstName),
            SpecifyLastName(travelerDetails.lastName),
            SpecifyHomeAddress(travelerDetails.address),
            SpecifyCountryOfResidence(travelerDetails.country),
            SpecifySeatPreference(travelerDetails.seatPreference),
            ToggleNewsletterSubscription.off(),
            ToggleTermsAndConditions.on(),
        )
