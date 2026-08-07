import { Component } from '@angular/core';
import { UserProfileComponent } from '../../../components/user-profile/user-profile';
import { UserAvatarComponent } from '../../../components/user-avatar/user-avatar';

@Component({
  selector: 'app-profile',
  imports: [UserProfileComponent, UserAvatarComponent],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {}
