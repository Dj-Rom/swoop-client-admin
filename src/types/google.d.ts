// src/types/google.d.ts
export {};

declare global {
  const google: {
    accounts: {
      id: {
        disableAutoSelect(): void;
        initialize(options: {
          client_id: string;
          callback?: (response: any) => void;
          cancel_on_tap_outside?: boolean;
          prompt_parent_id?: string;
          nonce?: string;
          context?: string;
          state?: string;
          ux_mode?: 'popup' | 'redirect';
          allowed_parent_origin?: string | string[];
          intermediate_iframe_close_callback?: () => void;
          itp_support?: boolean;
        }): void;
        prompt(options?: {
          moment?: string;
          native?: boolean;
          skip_use_hint?: boolean;
          suppress?: boolean;
        }): void;
        renderButton(
          element: HTMLElement,
          options: {
            type?: 'standard' | 'icon';
            theme?: 'outline' | 'filled_blue' | 'filled_black';
            size?: 'large' | 'medium' | 'small';
            text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
            shape?: 'rectangular' | 'pill' | 'circle' | 'square';
            logo_alignment?: 'left' | 'center';
            width?: number;
            locale?: string;
          },
        ): void;
        disableAutoSelect(): void;
      };
      oauth2: {
        initTokenClient(options: {
          client_id: string;
          scope: string;
          callback: (response: {
            access_token?: string;
            error?: string;
            error_description?: string;
            error_uri?: string;
          }) => void;
          error_callback?: (error: any) => void;
          ux_mode?: 'popup' | 'redirect';
          redirect_uri?: string;
          state?: string;
          prompt?: string;
          nonce?: string;
          hd?: string;
          login_hint?: string;
          include_granted_scopes?: boolean;
        }): any;
        initCodeClient(options: any): any;
      };
    };
  };
}
