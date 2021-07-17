import { Injectable }                                                                                         from '@angular/core';
import has                                                                                                    from 'lodash/has';
import * as moment_ from 'moment';
const moment = moment_;

@Injectable({
  providedIn: 'root'
})
export class UtilitiesService {

  /**
   * Returns true if a matching key and value are found in the array of objects.
   * For example key === 'name' and value === 'Fred' then the search will be for a match with {name: 'Fred'}
   */
  isKeyAndValueInArray(
    key:      string,
    value:    string,
    array:    any): boolean {

    let result = false;

    array.map(obj => {

      if (has(obj, key) && obj[key] === value) {

        result = true;

      }

    });

    return result;

  }

  /**
   * Returns the value of property prop for matching key and value.
   * If key and value not found then undefined is returned.
   */
  getPropertyForKeyAndValueInArray(
    key:      string,
    value:    string,
    prop:     string,
    array:    any): string {

    let result;

    array.map(obj => {

      if (key in obj && obj[key] === value) {
        result = obj[prop];
      }

    });

    return result;

  }

  msToDateTimeDisplay(ms: number): string {

    return moment(ms).format('DD-MM-YYYY HH:mm');

  }

}
