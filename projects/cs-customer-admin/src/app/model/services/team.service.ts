import { Injectable }                                                                                     from '@angular/core';
import { AngularFirestore }                                                                               from '@angular/fire/firestore';
import { Observable }                                                                                     from 'rxjs';
import { map }                                                                                            from 'rxjs/operators';
import { FirestoreUtilsService }                                                                          from 'shared-components';
import { Team }                                                                                           from 'cs-shared-components';
import { FS }                                                                                             from '../../../../../shared-files/firestore-constants';


@Injectable({
  providedIn: 'root'
})
export class TeamService {

  constructor(private afs:                          AngularFirestore,
              private fireStoreUtils:               FirestoreUtilsService) { }

  getTeamsFIRESTORE(customerFSKey: string): Observable<Team[]> {

    const path = `${FS.Customers}/${customerFSKey}/${FS.Teams}`;

    return this.afs.collection(path)
      .valueChanges()
      .pipe(
        map(Team.fromJsonList)
      );

  }

  getTeamFromFSKey(customerFSKey: string, teamFSKey: string): Observable<Team> {

    const path = `${FS.Customers}/${customerFSKey}/${FS.Teams}/${teamFSKey}`;

    return this.afs.doc(path)
      .valueChanges()
      .pipe(
        map(Team.fromJson)
      )

  }


  addTeam(customerFSKey: string, team: Team) {

    const path = `${FS.Customers}/${customerFSKey}/${FS.Teams}`;

    const docName = this.fireStoreUtils.docName();

    team.FSKey = docName;

    this.fireStoreUtils.addToCollection(this.afs, path, docName, team);

  }

  updateTeam(customerFSKey: string, team: Team) {

    const path = `${FS.Customers}/${customerFSKey}/${FS.Teams}`;

    this.fireStoreUtils.update(this.afs, path, team.FSKey, team);

  }

  deleteTeam(customerFSKey: string, teamFSKey: string) {

    const path = `${FS.Customers}/${customerFSKey}/${FS.Teams}/${teamFSKey}`;

    this.fireStoreUtils.delete(this.afs, path);

  }

}
