import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Storage } from '@ionic/storage';
import { environment } from 'src/environments/environment';
import { Browser } from '@capacitor/browser';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private loading: any;

  API_URL = environment.API_URL;
  hashedKey = environment.hashedKey;
  currentVersion = environment.currentVersion;

  browseroptions:any;

  constructor(
    public storage: Storage,
    private http:HttpClient
  ) {
    this.browseroptions = {
    location : 'no',//Or 'no'
    hidden : 'no', //Or 'yes'
    clearcache : 'yes',
    clearsessioncache : 'yes',
    zoom : 'no',//Android only ,shows browser zoom controls
    hardwareback : 'yes',
    mediaPlaybackRequiresUserAction : 'no',
    shouldPauseOnSuspend : 'no', //Android only
    //closebuttoncaption : 'Close', //iOS only
    //toolbar : 'yes', //iOS only
    //fullscreen : 'yes',//Windows only
    hidenavigationbuttons:'yes',
    toolbarposition:'bottom',
    toolbarcolor: '#F7C860',
    navigationbuttoncolor: '#4c5494',
    hideurlbar: 'yes',
  };
  }

  //new line
  SendTokenToServer(token: string): Promise<any> {
    return this.http.post('YOUR_API_ENDPOINT/send-token', { token }).toPromise();
  }

  // getDashboard() {
  //   return new Promise((resolve) => {
  //     resolve({
  //       result: {
  //         code: 1,
  //         data: {
  //           message: 'Dashboard mock loaded.',
  //           user: 'Test User'
  //         }
  //       }
  //     });
  //   });
  // }

  //new line ends here

  openLink(url: string) {
    Browser.open({ url });
  }
  async login(email:any,password:any) {
    const accessToken = await this.storage.get("authToken");
    let localinfo = {
      accessToken: accessToken,
      email: email,
      password: password,
      hashedKey: this.hashedKey
    };
    //console.log("login--"+JSON.stringify(localinfo), httpOptions);
    let httpOptions = {
        headers: new HttpHeaders({
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        })
    };
    return new Promise((resolve, reject) => {
      this.http.post(this.API_URL+'login', localinfo, httpOptions)
        .subscribe(res => {
          resolve(res);
        }, (err:any) => {
          console.error('API Error:', err);
          reject(err);
        });
    });
  }

  async register(credentials:any) {
    const accessToken = await this.storage.get("authToken");
    let referralCode = credentials.referralCode;
    let mobileNo = credentials.mobileNo;
    let email = credentials.email;
    let password = credentials.password;
    let firstName = credentials.firstName;
    let lastName = credentials.lastName;
    let accountType = credentials.accountType;
    let localinfo = {
      accessToken: accessToken,
      email: email,
      password: password,
      mobileNo: mobileNo,
      firstName: firstName,
      lastName: lastName,
      accountType: accountType,
      referralCode: referralCode,
      hashedKey: this.hashedKey
    };
    //console.log("register--"+JSON.stringify(localinfo), httpOptions);
    let httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      })
    };
    return new Promise((resolve, reject) => {
      this.http.post(this.API_URL+'register', localinfo, httpOptions)
        .subscribe(res => { //console.log("sucee--"+JSON.stringify(res));
          resolve(res);
        }, (err) => { //console.log("err--"+JSON.stringify(err));
          console.error('API Error:', err);
          reject(err);
        });
    });
  }

  async bookNow(
    credentials:any,
    services:any
  ) {
    const accessToken = await this.storage.get("authToken");
    let localinfo = {
      accessToken: accessToken,
      email: credentials.email,
      details: credentials.details,
      phone_number: credentials.phone_number,
      first_name: credentials.first_name,
      country: credentials.country,
      city: credentials.city,
      start_date: credentials.start_date,
      company: credentials.company,
      services: services,
      hashedKey: this.hashedKey
    };
    //console.log("register--"+JSON.stringify(localinfo), httpOptions);
    let httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      })
    };
    return new Promise((resolve, reject) => {
      this.http.post(this.API_URL+'bookNow', localinfo, httpOptions)
        .subscribe(res => {
          resolve(res);
        }, (err) => {
          console.error('API Error:', err);
          reject(err);
        });
    });
  }

  async loadCountries() {
    const accessToken = await this.storage.get("authToken");
    let localinfo = {
      accessToken: accessToken,
      hashedKey: this.hashedKey
    };
    let httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      })
    };
    return new Promise((resolve, reject) => {
      this.http.post(this.API_URL+'getCountries', localinfo, httpOptions)
        .subscribe(res => {
          resolve(res);
        }, (err) => {
          console.error('API Error:', err);
          reject(err);
        });
    });
  }


async loadCities(countryId:any) {
  const accessToken = await this.storage.get("authToken");
  let localinfo = {
    countryId: countryId,
    accessToken: accessToken,
    hashedKey: this.hashedKey
  };
  let httpOptions = {
    headers: new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    })
  };
  return new Promise((resolve, reject) => {
    this.http.post(this.API_URL+'getCities', localinfo, httpOptions)
      .subscribe(res => {
        resolve(res);
      }, (err) => {
        console.error('API Error:', err);
        reject(err);
      });
  });
}

async getCategories() {
  const accessToken = await this.storage.get("authToken");
  let localinfo = {
    accessToken: accessToken,
    hashedKey: this.hashedKey
  };
  let httpOptions = {
    headers: new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    })
  };
  return new Promise((resolve, reject) => {
    this.http.post(this.API_URL+'getCategories', localinfo, httpOptions)
      .subscribe(res => {
        resolve(res);
      }, (err) => {
        console.error('API Error:', err);
        reject(err);
      });
  });
}

async getDashboard() {
  const accessToken = await this.storage.get("authToken");

  let localinfo = {
    accessToken: accessToken,
    hashedKey: this.hashedKey
  };
  let httpOptions = {
    headers: new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    })
  };
  return new Promise((resolve, reject) => {
    this.http.post(this.API_URL+'getDashboard', localinfo, httpOptions)
      .subscribe(res => {
        resolve(res);
      }, (err) => {
        console.error('API Error:', err);
        reject(err);
      });
  });
}

async getPhotographerProfile() {
  const accessToken = await this.storage.get("authToken");
  let localinfo = {
    accessToken: accessToken,
    hashedKey: this.hashedKey
  };
  let httpOptions = {
    headers: new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    })
  };
  return new Promise((resolve, reject) => {
    this.http.post(this.API_URL+'getPhotographerProfile', localinfo, httpOptions)
      .subscribe(res => {
        resolve(res);
      }, (err) => {
        console.error('API Error:', err);
        reject(err);
      });
  });
}

async updatePhotographerProfile(credentials:any) {
  const accessToken = await this.storage.get("authToken");
  let localinfo = {
    accessToken: accessToken,
    hashedKey: this.hashedKey,
    first_name: credentials.first_name,
    last_name: credentials.last_name,
    country_id: credentials.country_id,
    city_id: credentials.city_id,
    phone_number: credentials.phone_number,
    whatsapp_number: credentials.whatsapp_number,
    bio: credentials.bio,
    category: credentials.category
  };
  let httpOptions = {
    headers: new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    })
  };
  return new Promise((resolve, reject) => {
    this.http.post(this.API_URL+'updatePhotographerProfile', localinfo, httpOptions)
      .subscribe(res => {
        resolve(res);
      }, (err) => {
        console.error('API Error:', err);
        reject(err);
      });
  });
}

async changePassword(credentials:any) {
  const accessToken = await this.storage.get("authToken");
  let cpassword = credentials.cpassword;
  let oldpassword = credentials.oldpassword;
  let password = credentials.password;
  let localinfo = { accessToken: accessToken, cpassword: cpassword, currentPassword: oldpassword, newPassword: password, hashedKey: this.hashedKey };
  //console.log("changePassword--"+JSON.stringify(localinfo), httpOptions);
  let httpOptions = {
    headers: new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    })
  };
  return new Promise((resolve, reject) => {
    this.http.post(this.API_URL+'changePassword', localinfo, httpOptions)
      .subscribe(res => {
        resolve(res);
      }, (err:any) => {
        console.error('API Error:', err);
        reject(err);
      });
  });
}

async deleteAccount() {
  const accessToken = await this.storage.get("authToken");
  let localinfo = {
    accessToken: accessToken,
    //description:credentials.description,
    hashedKey: this.hashedKey
  };
  //console.log("deleteAccount--"+JSON.stringify(localinfo), httpOptions);
  let httpOptions = {
    headers: new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    })
  };
  return new Promise((resolve, reject) => {
    this.http.post(this.API_URL+'deleteAccount', localinfo, httpOptions)
      .subscribe(res => {
        resolve(res);
      }, (err:any) => {
        console.error('API Error:', err);
        reject(err);
      });
  });
}

async forgotpass(credentials:any) {
  const accessToken = await this.storage.get("authToken");
  let email = credentials.email;
  let localinfo = {
    accessToken: accessToken,
    email: email,
    hashedKey: this.hashedKey
  };
  //console.log("forgotpass--"+JSON.stringify(localinfo), httpOptions);
  let httpOptions = {
    headers: new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    })
  };
  return new Promise((resolve, reject) => {
    this.http.post(this.API_URL+'forgotPass', localinfo, httpOptions)
      .subscribe(res => {
        resolve(res);
      }, (err:any) => {
        console.error('API Error:', err);
        reject(err);
      });
  });
}

async getCommunityList(pageNumber:any, isMine:any) {
  const accessToken = await this.storage.get("authToken");
  let localinfo = {
    accessToken: accessToken,
    hashedKey: this.hashedKey,
    pageNumber: pageNumber,
    isMine: isMine
  };
  //console.log("getCommunityList--"+JSON.stringify(localinfo), httpOptions);
  let httpOptions = {
    headers: new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    })
  };
  return new Promise((resolve, reject) => {
    this.http.post(this.API_URL+'getCommunityList', localinfo, httpOptions)
      .subscribe(res => {
        resolve(res);
      }, (err:any) => {
        console.error('API Error:', err);
        reject(err);
      });
  });
}

async saveCommunityItem(credentials:any) {
  const accessToken = await this.storage.get("authToken");
  let localinfo = {
    id: credentials.id,
    question: credentials.question,
    accessToken: accessToken,
    hashedKey: this.hashedKey
  };
  //console.log("updateCommunityItem--"+JSON.stringify(localinfo), httpOptions);
  let httpOptions = {
    headers: new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    })
  };
  return new Promise((resolve, reject) => {
    this.http.post(this.API_URL+'saveCommunityItem', localinfo, httpOptions)
      .subscribe(res => {
        resolve(res);
      }, (err:any) => {
        console.error('API Error:', err);
        reject(err);
      });
  });
}

async deleteCommunityItem(id:any) {
  const accessToken = await this.storage.get("authToken");
  let localinfo = {
    id: id,
    accessToken: accessToken,
    hashedKey: this.hashedKey
  };
  //console.log("updateCommunityItem--"+JSON.stringify(localinfo), httpOptions);
  let httpOptions = {
    headers: new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    })
  };
  return new Promise((resolve, reject) => {
    this.http.post(this.API_URL+'deleteCommunityItem', localinfo, httpOptions)
      .subscribe(res => {
        resolve(res);
      }, (err:any) => {
        console.error('API Error:', err);
        reject(err);
      });
  });
}

async getCommentsList(pageNumber:any, questionId:any) {
  const accessToken = await this.storage.get("authToken");
  let localinfo = {
    accessToken: accessToken,
    hashedKey: this.hashedKey,
    pageNumber: pageNumber,
    questionId: questionId
  };
  //console.log("getCommentsList--"+JSON.stringify(localinfo), httpOptions);
  let httpOptions = {
    headers: new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    })
  };
  return new Promise((resolve, reject) => {
    this.http.post(this.API_URL+'getCommentsList', localinfo, httpOptions)
      .subscribe(res => {
        resolve(res);
      }, (err:any) => {
        console.error('API Error:', err);
        reject(err);
      });
  });
}

async saveComment(credentials:any) {
  const accessToken = await this.storage.get("authToken");
  let localinfo = {
    questionId: credentials.questionId,
    comment: credentials.comment,
    accessToken: accessToken,
    hashedKey: this.hashedKey
  };
  //console.log("updateCommunityItem--"+JSON.stringify(localinfo), httpOptions);
  let httpOptions = {
    headers: new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    })
  };
  return new Promise((resolve, reject) => {
    this.http.post(this.API_URL+'saveComment', localinfo, httpOptions)
      .subscribe(res => {
        resolve(res);
      }, (err:any) => {
        console.error('API Error:', err);
        reject(err);
      });
  });
}

async getBookings(pageNumber:any, status:any, year:any, city_id:any, country_id:any) {
  const accessToken = await this.storage.get("authToken");
  let localinfo = {
    accessToken: accessToken,
    hashedKey: this.hashedKey,
    pageNumber: pageNumber,
    status: status,
    year: year,
    city_id: city_id,
    country_id: country_id
  };
  //console.log("getBookings--"+JSON.stringify(localinfo), httpOptions);
  let httpOptions = {
    headers: new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    })
  };
  return new Promise((resolve, reject) => {
    this.http.post(this.API_URL+'getBookings', localinfo, httpOptions)
      .subscribe(res => {
        resolve(res);
      }, (err:any) => {
        console.error('API Error:', err);
        reject(err);
      });
  });
}

async logout() {
  const accessToken = await this.storage.get("KikashaAccessToken");
  let localinfo = { accessToken: accessToken, hashedKey: this.hashedKey };
  //console.log("logout--"+JSON.stringify(localinfo), httpOptions);
  let httpOptions = {
    headers: new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    })
  };

  this.storage.set('KikashaUphasLoggedIn', false);
  //this.storage.set('KikashaUphasSeenTutorial', 'false');
  localStorage.removeItem("Papricutcustomeremail");
  localStorage.removeItem("authToken");
  localStorage.removeItem("PapricutRightsGroup");
  localStorage.removeItem("Papricutcustomerfirstname");
  localStorage.removeItem("Papricutcustomerlastname");
  localStorage.removeItem("PapricutcustomermobileNo");
  localStorage.removeItem("PapricutisSuper");

  return new Promise((resolve, reject) => {
    this.http.post(this.API_URL+'logout', localinfo, httpOptions)
      .subscribe(res => {
        resolve(res);
      }, (err:any) => {
        console.error('API Error:', err);
        reject(err);
      });
  });
}

async checkVersion(platform:any) {
  const accessToken = await this.storage.get("authToken");
  let localinfo = { platform: platform, accessToken: accessToken, version: this.currentVersion, url: this.API_URL, hashedKey: this.hashedKey };
  return new Promise((resolve, reject) => {
    this.http.post(this.API_URL+'checkVersion', localinfo)
      .subscribe(res => {
        resolve(res);
      }, (err:any) => {
        console.error('API Error:', err);
        reject(err);
      });
  });
} 
}