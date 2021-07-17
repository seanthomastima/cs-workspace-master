import { Injectable }                                                         from '@angular/core';
import { AngularFirestore }                                                   from '@angular/fire/firestore';
import { first, map }                                                         from 'rxjs/operators';
import {from, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirestoreUtilsService {

  documentExists(afs: AngularFirestore, path: string): Observable<boolean> {

    return afs.doc(path)
      .valueChanges()
      .pipe(
        first(),
        map(res => !!res)
      );

  }

  update(afs: AngularFirestore, path: string, docName: string, data: any) {

    afs.doc(`${path}/${docName}`)
      .update(Object.assign({}, data))
      .catch(error => {
        console.error('Error in FireStoreUtils update(): ', error);
      });

  }

  delete(afs: AngularFirestore, path: string) {

    afs.doc(path)
      .delete()
      .catch(error => {
        console.error('Error in FireStoreUtils delete()', error);
      });

  }

  addToCollection(afs: AngularFirestore, path: string, name: string, object: any): Observable<any> {

    return from(afs.collection(path)
      .doc(name)
      .set(Object.assign({}, object))
      .catch(error => {
        console.error('Error in FireStoreUtils addToCollection(): ', error);
      })
    );

  }

  docName(): string {

    return Date.now().toString() + this.randomString();

  }

  private randomString(length = 5): string {

    let text = '';

    const pickString = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {

      text += pickString.charAt(Math.floor(Math.random() * pickString.length));

    }

    return text;

  }

}
