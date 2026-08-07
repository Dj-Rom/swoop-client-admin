import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
  styles: `
    :host {
      background-image: url('https://dj-rom.github.io/swoop-client-admin/assets/bg/Gemini_bg.png');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      width: 100%;
      min-height: 100vh;
      display: block;
    }
  `,
})
export class SignUp {}
