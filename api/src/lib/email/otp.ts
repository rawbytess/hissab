export function otpEmail(
	otp: string,
	expirationWords: string,
	appName: string,
	themeColor: string,
	logoUrl: string,
) {
	return `
  <!--
* This email was built using Tabular.
* For more information, visit https://tabular.email
-->
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html
  xmlns="http://www.w3.org/1999/xhtml"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  lang="en"
>
  <head>
    <title></title>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <!--[if !mso]>-->
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <!--<![endif]-->
    <meta name="x-apple-disable-message-reformatting" content="" />
    <meta content="target-densitydpi=device-dpi" name="viewport" />
    <meta content="true" name="HandheldFriendly" />
    <meta content="width=device-width" name="viewport" />
    <meta
      name="format-detection"
      content="telephone=no, date=no, address=no, email=no, url=no"
    />
    <style type="text/css">
      table {
        border-collapse: separate;
        table-layout: fixed;
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
      }
      table td {
        border-collapse: collapse;
      }
      .ExternalClass {
        width: 100%;
      }
      .ExternalClass,
      .ExternalClass p,
      .ExternalClass span,
      .ExternalClass font,
      .ExternalClass td,
      .ExternalClass div {
        line-height: 100%;
      }
      body,
      a,
      li,
      p,
      h1,
      h2,
      h3 {
        -ms-text-size-adjust: 100%;
        -webkit-text-size-adjust: 100%;
      }
      html {
        -webkit-text-size-adjust: none !important;
      }
      body,
      #innerTable {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      #innerTable img + div {
        display: none;
        display: none !important;
      }
      img {
        margin: 0;
        padding: 0;
        -ms-interpolation-mode: bicubic;
      }
      h1,
      h2,
      h3,
      p,
      a {
        line-height: inherit;
        overflow-wrap: normal;
        white-space: normal;
        word-break: break-word;
      }
      a {
        text-decoration: none;
      }
      h1,
      h2,
      h3,
      p {
        min-width: 100% !important;
        width: 100% !important;
        max-width: 100% !important;
        display: inline-block !important;
        border: 0;
        padding: 0;
        margin: 0;
      }
      a[x-apple-data-detectors] {
        color: inherit !important;
        text-decoration: none !important;
        font-size: inherit !important;
        font-family: inherit !important;
        font-weight: inherit !important;
        line-height: inherit !important;
      }
      u + #body a {
        color: inherit;
        text-decoration: none;
        font-size: inherit;
        font-family: inherit;
        font-weight: inherit;
        line-height: inherit;
      }
      a[href^="mailto"],
      a[href^="tel"],
      a[href^="sms"] {
        color: inherit;
        text-decoration: none;
      }
    </style>
    <style type="text/css">
      @media (min-width: 481px) {
        .hd {
          display: none !important;
        }
      }
    </style>
    <style type="text/css">
      @media (max-width: 480px) {
        .hm {
          display: none !important;
        }
      }
    </style>
    <style type="text/css">
      @media (max-width: 480px) {
        .t51 {
          padding: 0 0 22px !important;
        }
        .t36,
        .t47,
        .t63,
        .t8 {
          text-align: left !important;
        }
        .t35,
        .t46,
        .t62,
        .t7 {
          vertical-align: top !important;
          width: 600px !important;
        }
        .t5 {
          border-top-left-radius: 0 !important;
          border-top-right-radius: 0 !important;
          padding: 20px 30px !important;
        }
        .t33 {
          border-bottom-right-radius: 0 !important;
          border-bottom-left-radius: 0 !important;
          padding: 30px !important;
        }
        .t71 {
          mso-line-height-alt: 20px !important;
          line-height: 20px !important;
        }
        .t3 {
          width: 44px !important;
        }
      }
    </style>
    <!--[if !mso]>-->
    <link
      href="https://fonts.googleapis.com/css2?family=Albert+Sans:wght@500;800&amp;family=Inter:wght@400&amp;display=swap"
      rel="stylesheet"
      type="text/css"
    />
    <!--<![endif]-->
    <!--[if mso]>
      <xml>
        <o:OfficeDocumentSettings>
          <o:AllowPNG />
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml>
    <![endif]-->
  </head>
  <body
    id="body"
    class="t74"
    style="
      min-width: 100%;
      margin: 0px;
      padding: 0px;
      background-color: #e0e0e0;
    "
  >
    <div class="t73" style="background-color: #e0e0e0">
      <table
        role="presentation"
        width="100%"
        cellpadding="0"
        cellspacing="0"
        border="0"
        align="center"
      >
        <tr>
          <td
            class="t72"
            style="
              font-size: 0;
              line-height: 0;
              mso-line-height-rule: exactly;
              background-color: #e0e0e0;
            "
            valign="top"
            align="center"
          >
            <!--[if mso]>
              <v:background
                xmlns:v="urn:schemas-microsoft-com:vml"
                fill="true"
                stroke="false"
              >
                <v:fill color="#E0E0E0" />
              </v:background>
            <![endif]-->
            <table
              role="presentation"
              width="100%"
              cellpadding="0"
              cellspacing="0"
              border="0"
              align="center"
              id="innerTable"
            >
              <tr>
                <td align="center">
                  <table
                    class="t54"
                    role="presentation"
                    cellpadding="0"
                    cellspacing="0"
                    style="margin-left: auto; margin-right: auto"
                  >
                    <tr>
                      <td width="566" class="t53" style="width: 566px">
                        <table
                          class="t52"
                          role="presentation"
                          cellpadding="0"
                          cellspacing="0"
                          width="100%"
                          style="width: 100%"
                        >
                          <tr>
                            <td
                              class="t51"
                              style="padding: 50px 10px 31px 10px"
                            >
                              <div
                                class="t50"
                                style="width: 100%; text-align: left"
                              >
                                <div class="t49" style="display: inline-block">
                                  <table
                                    class="t48"
                                    role="presentation"
                                    cellpadding="0"
                                    cellspacing="0"
                                    align="left"
                                    valign="top"
                                  >
                                    <tr class="t47">
                                      <td></td>
                                      <td class="t46" width="546" valign="top">
                                        <table
                                          role="presentation"
                                          width="100%"
                                          cellpadding="0"
                                          cellspacing="0"
                                          class="t45"
                                          style="width: 100%"
                                        >
                                          <tr>
                                            <td
                                              class="t44"
                                              style="
                                                background-color: transparent;
                                              "
                                            >
                                              <table
                                                role="presentation"
                                                width="100%"
                                                cellpadding="0"
                                                cellspacing="0"
                                                style="width: 100% !important"
                                              >
                                                <tr>
                                                  <td align="center">
                                                    <table
                                                      class="t15"
                                                      role="presentation"
                                                      cellpadding="0"
                                                      cellspacing="0"
                                                      style="
                                                        margin-left: auto;
                                                        margin-right: auto;
                                                      "
                                                    >
                                                      <tr>
                                                        <td
                                                          width="546"
                                                          class="t14"
                                                          style="width: 600px"
                                                        >
                                                          <table
                                                            class="t13"
                                                            role="presentation"
                                                            cellpadding="0"
                                                            cellspacing="0"
                                                            width="100%"
                                                            style="width: 100%"
                                                          >
                                                            <tr>
                                                              <td class="t12">
                                                                <div
                                                                  class="t11"
                                                                  style="
                                                                    width: 100%;
                                                                    text-align: left;
                                                                  "
                                                                >
                                                                  <div
                                                                    class="t10"
                                                                    style="
                                                                      display: inline-block;
                                                                    "
                                                                  >
                                                                    <table
                                                                      class="t9"
                                                                      role="presentation"
                                                                      cellpadding="0"
                                                                      cellspacing="0"
                                                                      align="left"
                                                                      valign="top"
                                                                    >
                                                                      <tr
                                                                        class="t8"
                                                                      >
                                                                        <td></td>
                                                                        <td
                                                                          class="t7"
                                                                          width="546"
                                                                          valign="top"
                                                                        >
                                                                          <table
                                                                            role="presentation"
                                                                            width="100%"
                                                                            cellpadding="0"
                                                                            cellspacing="0"
                                                                            class="t6"
                                                                            style="
                                                                              width: 100%;
                                                                            "
                                                                          >
                                                                            <tr>
                                                                              <td
                                                                                class="t5"
                                                                                style="
                                                                                  overflow: hidden;
                                                                                  background-color: ${themeColor};
                                                                                  padding: 49px
                                                                                    50px
                                                                                    42px
                                                                                    50px;
                                                                                  border-radius: 18px
                                                                                    18px
                                                                                    0
                                                                                    0;
                                                                                "
                                                                              >
                                                                                <table
                                                                                  role="presentation"
                                                                                  width="100%"
                                                                                  cellpadding="0"
                                                                                  cellspacing="0"
                                                                                  style="
                                                                                    width: 100% !important;
                                                                                  "
                                                                                >
                                                                                  <tr>
                                                                                    <td
                                                                                      align="left"
                                                                                    >
                                                                                      <table
                                                                                        class="t4"
                                                                                        role="presentation"
                                                                                        cellpadding="0"
                                                                                        cellspacing="0"
                                                                                        style="
                                                                                          margin-right: auto;
                                                                                        "
                                                                                      >
                                                                                        <tr>
                                                                                          <td
                                                                                            width="85"
                                                                                            class="t3"
                                                                                            style="
                                                                                              width: 85px;
                                                                                            "
                                                                                          >
                                                                                            <table
                                                                                              class="t2"
                                                                                              role="presentation"
                                                                                              cellpadding="0"
                                                                                              cellspacing="0"
                                                                                              width="100%"
                                                                                              style="
                                                                                                width: 100%;
                                                                                              "
                                                                                            >
                                                                                              <tr>
                                                                                                <td
                                                                                                  class="t1"
                                                                                                >
                                                                                                  <div
                                                                                                    style="
                                                                                                      font-size: 0px;
                                                                                                    "
                                                                                                  >
                                                                                                    <img
                                                                                                      class="t0"
                                                                                                      style="
                                                                                                        display: block;
                                                                                                        border: 0;
                                                                                                        height: auto;
                                                                                                        width: 100%;
                                                                                                        margin: 0;
                                                                                                        max-width: 100%;
                                                                                                      "
                                                                                                      width="85"
                                                                                                      height="85"
                                                                                                      alt=""
                                                                                                      src=${logoUrl}
                                                                                                    />
                                                                                                  </div>
                                                                                                </td>
                                                                                              </tr>
                                                                                            </table>
                                                                                          </td>
                                                                                        </tr>
                                                                                      </table>
                                                                                    </td>
                                                                                  </tr>
                                                                                </table>
                                                                              </td>
                                                                            </tr>
                                                                          </table>
                                                                        </td>
                                                                        <td></td>
                                                                      </tr>
                                                                    </table>
                                                                  </div>
                                                                </div>
                                                              </td>
                                                            </tr>
                                                          </table>
                                                        </td>
                                                      </tr>
                                                    </table>
                                                  </td>
                                                </tr>
                                                <tr>
                                                  <td align="center">
                                                    <table
                                                      class="t43"
                                                      role="presentation"
                                                      cellpadding="0"
                                                      cellspacing="0"
                                                      style="
                                                        margin-left: auto;
                                                        margin-right: auto;
                                                      "
                                                    >
                                                      <tr>
                                                        <td
                                                          width="546"
                                                          class="t42"
                                                          style="width: 600px"
                                                        >
                                                          <table
                                                            class="t41"
                                                            role="presentation"
                                                            cellpadding="0"
                                                            cellspacing="0"
                                                            width="100%"
                                                            style="width: 100%"
                                                          >
                                                            <tr>
                                                              <td class="t40">
                                                                <div
                                                                  class="t39"
                                                                  style="
                                                                    width: 100%;
                                                                    text-align: left;
                                                                  "
                                                                >
                                                                  <div
                                                                    class="t38"
                                                                    style="
                                                                      display: inline-block;
                                                                    "
                                                                  >
                                                                    <table
                                                                      class="t37"
                                                                      role="presentation"
                                                                      cellpadding="0"
                                                                      cellspacing="0"
                                                                      align="left"
                                                                      valign="top"
                                                                    >
                                                                      <tr
                                                                        class="t36"
                                                                      >
                                                                        <td></td>
                                                                        <td
                                                                          class="t35"
                                                                          width="546"
                                                                          valign="top"
                                                                        >
                                                                          <table
                                                                            role="presentation"
                                                                            width="100%"
                                                                            cellpadding="0"
                                                                            cellspacing="0"
                                                                            class="t34"
                                                                            style="
                                                                              width: 100%;
                                                                            "
                                                                          >
                                                                            <tr>
                                                                              <td
                                                                                class="t33"
                                                                                style="
                                                                                  overflow: hidden;
                                                                                  background-color: #f8f8f8;
                                                                                  padding: 40px
                                                                                    50px
                                                                                    40px
                                                                                    50px;
                                                                                  border-radius: 0
                                                                                    0
                                                                                    18px
                                                                                    18px;
                                                                                "
                                                                              >
                                                                                <table
                                                                                  role="presentation"
                                                                                  width="100%"
                                                                                  cellpadding="0"
                                                                                  cellspacing="0"
                                                                                  style="
                                                                                    width: 100% !important;
                                                                                  "
                                                                                >
                                                                                  <tr>
                                                                                    <td
                                                                                      align="center"
                                                                                    >
                                                                                      <table
                                                                                        class="t20"
                                                                                        role="presentation"
                                                                                        cellpadding="0"
                                                                                        cellspacing="0"
                                                                                        style="
                                                                                          margin-left: auto;
                                                                                          margin-right: auto;
                                                                                        "
                                                                                      >
                                                                                        <tr>
                                                                                          <td
                                                                                            width="381"
                                                                                            class="t19"
                                                                                            style="
                                                                                              width: 381px;
                                                                                            "
                                                                                          >
                                                                                            <table
                                                                                              class="t18"
                                                                                              role="presentation"
                                                                                              cellpadding="0"
                                                                                              cellspacing="0"
                                                                                              width="100%"
                                                                                              style="
                                                                                                width: 100%;
                                                                                              "
                                                                                            >
                                                                                              <tr>
                                                                                                <td
                                                                                                  class="t17"
                                                                                                >
                                                                                                  <h1
                                                                                                    class="t16"
                                                                                                    style="
                                                                                                      margin: 0;
                                                                                                      margin: 0;
                                                                                                      font-family:
                                                                                                        Albert
                                                                                                          Sans,
                                                                                                        BlinkMacSystemFont,
                                                                                                        Segoe
                                                                                                          UI,
                                                                                                        Helvetica
                                                                                                          Neue,
                                                                                                        Arial,
                                                                                                        sans-serif;
                                                                                                      line-height: 41px;
                                                                                                      font-weight: 800;
                                                                                                      font-style: normal;
                                                                                                      font-size: 30px;
                                                                                                      text-decoration: none;
                                                                                                      text-transform: none;
                                                                                                      letter-spacing: -1.56px;
                                                                                                      direction: ltr;
                                                                                                      color: #191919;
                                                                                                      text-align: left;
                                                                                                      mso-line-height-rule: exactly;
                                                                                                      mso-text-raise: 3px;
                                                                                                    "
                                                                                                  >
                                                                                                    Your
                                                                                                    ${appName}
                                                                                                    OTP
                                                                                                  </h1>
                                                                                                </td>
                                                                                              </tr>
                                                                                            </table>
                                                                                          </td>
                                                                                        </tr>
                                                                                      </table>
                                                                                    </td>
                                                                                  </tr>
                                                                                  <tr>
                                                                                    <td>
                                                                                      <div
                                                                                        class="t21"
                                                                                        style="
                                                                                          mso-line-height-rule: exactly;
                                                                                          mso-line-height-alt: 25px;
                                                                                          line-height: 25px;
                                                                                          font-size: 1px;
                                                                                          display: block;
                                                                                        "
                                                                                      >
                                                                                        &nbsp;&nbsp;
                                                                                      </div>
                                                                                    </td>
                                                                                  </tr>
                                                                                  <tr>
                                                                                    <td
                                                                                      align="center"
                                                                                    >
                                                                                      <table
                                                                                        class="t26"
                                                                                        role="presentation"
                                                                                        cellpadding="0"
                                                                                        cellspacing="0"
                                                                                        style="
                                                                                          margin-left: auto;
                                                                                          margin-right: auto;
                                                                                        "
                                                                                      >
                                                                                        <tr>
                                                                                          <td
                                                                                            width="446"
                                                                                            class="t25"
                                                                                            style="
                                                                                              width: 600px;
                                                                                            "
                                                                                          >
                                                                                            <table
                                                                                              class="t24"
                                                                                              role="presentation"
                                                                                              cellpadding="0"
                                                                                              cellspacing="0"
                                                                                              width="100%"
                                                                                              style="
                                                                                                width: 100%;
                                                                                              "
                                                                                            >
                                                                                              <tr>
                                                                                                <td
                                                                                                  class="t23"
                                                                                                >
                                                                                                  <div
                                                                                                    class="t22"
                                                                                                    style="
                                                                                                      margin: 0;
                                                                                                      margin: 0;
                                                                                                      font-family:
                                                                                                        Inter,
                                                                                                        BlinkMacSystemFont,
                                                                                                        Segoe
                                                                                                          UI,
                                                                                                        Helvetica
                                                                                                          Neue,
                                                                                                        Arial,
                                                                                                        sans-serif;
                                                                                                      line-height: 22px;
                                                                                                      font-weight: 400;
                                                                                                      font-style: normal;
                                                                                                      font-size: 30px;
                                                                                                      text-decoration: none;
                                                                                                      text-transform: none;
                                                                                                      letter-spacing: 10px;
                                                                                                      direction: ltr;
                                                                                                      color: ${themeColor};
                                                                                                      text-align: center;
                                                                                                      mso-line-height-rule: exactly;
                                                                                                      mso-text-raise: -2px;
                                                                                                    "
                                                                                                  >
                                                                                                    ${otp}
                                                                                                  </div>
                                                                                                </td>
                                                                                              </tr>
                                                                                            </table>
                                                                                          </td>
                                                                                        </tr>
                                                                                      </table>
                                                                                    </td>
                                                                                  </tr>
                                                                                  <tr>
                                                                                    <td>
                                                                                      <div
                                                                                        class="t27"
                                                                                        style="
                                                                                          mso-line-height-rule: exactly;
                                                                                          mso-line-height-alt: 50px;
                                                                                          line-height: 50px;
                                                                                          font-size: 1px;
                                                                                          display: block;
                                                                                        "
                                                                                      >
                                                                                        &nbsp;&nbsp;
                                                                                      </div>
                                                                                    </td>
                                                                                  </tr>
                                                                                  <tr>
                                                                                    <td
                                                                                      align="left"
                                                                                    >
                                                                                      <table
                                                                                        class="t32"
                                                                                        role="presentation"
                                                                                        cellpadding="0"
                                                                                        cellspacing="0"
                                                                                        style="
                                                                                          margin-right: auto;
                                                                                        "
                                                                                      >
                                                                                        <tr>
                                                                                          <td
                                                                                            width="446"
                                                                                            class="t31"
                                                                                            style="
                                                                                              width: 563px;
                                                                                            "
                                                                                          >
                                                                                            <table
                                                                                              class="t30"
                                                                                              role="presentation"
                                                                                              cellpadding="0"
                                                                                              cellspacing="0"
                                                                                              width="100%"
                                                                                              style="
                                                                                                width: 100%;
                                                                                              "
                                                                                            >
                                                                                              <tr>
                                                                                                <td
                                                                                                  class="t29"
                                                                                                >
                                                                                                  <p
                                                                                                    class="t28"
                                                                                                    style="
                                                                                                      margin: 0;
                                                                                                      margin: 0;
                                                                                                      font-family:
                                                                                                        Albert
                                                                                                          Sans,
                                                                                                        BlinkMacSystemFont,
                                                                                                        Segoe
                                                                                                          UI,
                                                                                                        Helvetica
                                                                                                          Neue,
                                                                                                        Arial,
                                                                                                        sans-serif;
                                                                                                      line-height: 22px;
                                                                                                      font-weight: 500;
                                                                                                      font-style: normal;
                                                                                                      font-size: 14px;
                                                                                                      text-decoration: none;
                                                                                                      text-transform: none;
                                                                                                      letter-spacing: -0.56px;
                                                                                                      direction: ltr;
                                                                                                      color: #333333;
                                                                                                      text-align: left;
                                                                                                      mso-line-height-rule: exactly;
                                                                                                      mso-text-raise: 2px;
                                                                                                    "
                                                                                                  >
                                                                                                    The
                                                                                                    otp
                                                                                                    will
                                                                                                    remain
                                                                                                    valid
                                                                                                    for
                                                                                                    ${expirationWords}
                                                                                                    or
                                                                                                    until
                                                                                                    it
                                                                                                    is
                                                                                                    used.
                                                                                                  </p>
                                                                                                </td>
                                                                                              </tr>
                                                                                            </table>
                                                                                          </td>
                                                                                        </tr>
                                                                                      </table>
                                                                                    </td>
                                                                                  </tr>
                                                                                </table>
                                                                              </td>
                                                                            </tr>
                                                                          </table>
                                                                        </td>
                                                                        <td></td>
                                                                      </tr>
                                                                    </table>
                                                                  </div>
                                                                </div>
                                                              </td>
                                                            </tr>
                                                          </table>
                                                        </td>
                                                      </tr>
                                                    </table>
                                                  </td>
                                                </tr>
                                              </table>
                                            </td>
                                          </tr>
                                        </table>
                                      </td>
                                      <td></td>
                                    </tr>
                                  </table>
                                </div>
                              </div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td align="center">
                  <table
                    class="t70"
                    role="presentation"
                    cellpadding="0"
                    cellspacing="0"
                    style="margin-left: auto; margin-right: auto"
                  >
                    <tr>
                      <td width="600" class="t69" style="width: 600px">
                        <table
                          class="t68"
                          role="presentation"
                          cellpadding="0"
                          cellspacing="0"
                          width="100%"
                          style="width: 100%"
                        >
                          <tr>
                            <td class="t67">
                              <div
                                class="t66"
                                style="width: 100%; text-align: left"
                              >
                                <div class="t65" style="display: inline-block">
                                  <table
                                    class="t64"
                                    role="presentation"
                                    cellpadding="0"
                                    cellspacing="0"
                                    align="left"
                                    valign="top"
                                  >
                                    <tr class="t63">
                                      <td></td>
                                      <td class="t62" width="600" valign="top">
                                        <table
                                          role="presentation"
                                          width="100%"
                                          cellpadding="0"
                                          cellspacing="0"
                                          class="t61"
                                          style="width: 100%"
                                        >
                                          <tr>
                                            <td
                                              class="t60"
                                              style="padding: 0 50px 0 50px"
                                            >
                                              <table
                                                role="presentation"
                                                width="100%"
                                                cellpadding="0"
                                                cellspacing="0"
                                                style="width: 100% !important"
                                              >
                                                <tr>
                                                  <td align="center">
                                                    <table
                                                      class="t59"
                                                      role="presentation"
                                                      cellpadding="0"
                                                      cellspacing="0"
                                                      style="
                                                        margin-left: auto;
                                                        margin-right: auto;
                                                      "
                                                    >
                                                      <tr>
                                                        <td
                                                          width="500"
                                                          class="t58"
                                                          style="width: 600px"
                                                        >
                                                          <table
                                                            class="t57"
                                                            role="presentation"
                                                            cellpadding="0"
                                                            cellspacing="0"
                                                            width="100%"
                                                            style="width: 100%"
                                                          >
                                                            <tr>
                                                              <td class="t56">
                                                                <p
                                                                  class="t55"
                                                                  style="
                                                                    margin: 0;
                                                                    margin: 0;
                                                                    font-family:
                                                                      Albert
                                                                        Sans,
                                                                      BlinkMacSystemFont,
                                                                      Segoe UI,
                                                                      Helvetica
                                                                        Neue,
                                                                      Arial,
                                                                      sans-serif;
                                                                    line-height: 22px;
                                                                    font-weight: 500;
                                                                    font-style: normal;
                                                                    font-size: 12px;
                                                                    text-decoration: none;
                                                                    text-transform: none;
                                                                    direction: ltr;
                                                                    color: #888888;
                                                                    text-align: center;
                                                                    mso-line-height-rule: exactly;
                                                                    mso-text-raise: 3px;
                                                                  "
                                                                >
                                                                  © ${new Date().getFullYear()}
                                                                  ${appName}. All
                                                                  Rights
                                                                  Reserved<br />
                                                                </p>
                                                              </td>
                                                            </tr>
                                                          </table>
                                                        </td>
                                                      </tr>
                                                    </table>
                                                  </td>
                                                </tr>
                                              </table>
                                            </td>
                                          </tr>
                                        </table>
                                      </td>
                                      <td></td>
                                    </tr>
                                  </table>
                                </div>
                              </div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td>
                  <div
                    class="t71"
                    style="
                      mso-line-height-rule: exactly;
                      mso-line-height-alt: 50px;
                      line-height: 50px;
                      font-size: 1px;
                      display: block;
                    "
                  >
                    &nbsp;&nbsp;
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
    <div
      class="gmail-fix"
      style="
        display: none;
        white-space: nowrap;
        font: 15px courier;
        line-height: 0;
      "
    >
      &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
      &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
      &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
    </div>
  </body>
</html>

  `;
}
