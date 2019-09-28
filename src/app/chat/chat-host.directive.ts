import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[chatList-host]',
})
export class ChatHostDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}
