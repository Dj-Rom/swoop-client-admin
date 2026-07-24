import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

interface Breadcrumb {
  label: string;
  url: string;
}

@Component({
  selector: 'app-breadcrumbs',
  imports: [NgFor, RouterLink, NgIf],
  templateUrl: './breadcrumbs.html',
  styleUrl: './breadcrumbs.scss',
})
export class Breadcrumbs {
  breadcrumbs: Breadcrumb[] = [];

  constructor(private router: Router) {
    this.createBreadcrumbs();
  }

  createBreadcrumbs() {
    const parts = this.router.url.split('/').filter(Boolean);

    let url = '';

    this.breadcrumbs = parts.map((item) => {
      url += `/${item}`;

      return {
        label: this.formatLabel(item),
        url: url,
      };
    });
  }

  formatLabel(value: string): string {
    return value.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  }
}
