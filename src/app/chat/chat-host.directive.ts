import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[chat-host]',
})
export class ChatHostDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}
